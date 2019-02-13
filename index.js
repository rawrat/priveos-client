'use strict'
import secrets from 'secrets.js-grempe'
import assert from 'assert'
import axios from 'axios'
import eosjs_ecc from 'eosjs-ecc'
import Eos from 'eosjs'
import getMultiHash from './multihash'
import { Symbol, Asset } from './types'

const log = require('loglevel')


const default_options = {
  token_symbol: new Symbol("4,EOS"),
  actions: [],
}

function add_defaults(options) {
  return Object.assign(default_options, options)
}

export default class Priveos {
  constructor(config) {
    if (!config) throw new Error('Instantiating Priveos requires config object')
    if (!config.privateKey && !config.eos) throw new Error('Instantiating Priveos requires either config.privateKey or config.eos proxy instance (e.g. scatter)')
    if (config.privateKey && !config.publicKey) throw new Error('When passing config.privateKey the related config.publicKey must be present too')
    if (config.ephemeralKeyPrivate && !config.ephemeralKeyPublic) throw new Error('When passing config.ephemeralKeyPrivate the related config.ephemeralKeyPublic must be present too')
    if (!config.dappContract) throw new Error('Instantiating Priveos requires a dappContract set')
    if (!config.chainId) throw new Error('No chainId given')
    if (!config.brokerUrl) throw new Error('No brokerUrl given')
    if (!config.httpEndpoint) throw new Error('No httpEndpoint give')
    
    this.config = config

    if(this.config.threshold_fun) {
      this.threshold_fun = this.config.threshold_fun
    } else {
      this.threshold_fun = Priveos.default_threshold_fun
    }
    
    if(this.config.auditable) {
      this.auditable = 1
    } else {
      this.auditable = 0
    }
    
    if(this.config.contractpays) {
      this.contractpays = 1
    } else {
      this.contractpays = 0
    }
    
    if(typeof this.config.timeout_seconds == 'undefined') {
      this.config.timeout_seconds = 10
    }
    
    log.setDefaultLevel(this.config.logLevel || 'info')
    
    if (this.config.privateKey) {
      this.eos = Eos({httpEndpoint:this.config.httpEndpoint, chainId: this.config.chainId, keyProvider: [this.config.privateKey]})
    } else {
      this.eos = this.config.eos
    }
    
    
    if(!this.config.priveosContract) {
      this.config.priveosContract = 'priveosrules'
    }
    
    this.check_chain_id()
  }

  /**
   * Trigger a store transaction at priveos level alongside the passed actions
   * @param {string} owner 
   * @param {string} file 
   * @param {Uint8Array} shared_secret 
   * @param {object} options
   */
  async store(owner, file, shared_secret, options={}) {
    log.debug(`\r\n###\r\npriveos.store(${owner}, ${file})`)
    
    assert.ok(owner && file, "Owner and file must be supplied")
    assert.ok(shared_secret, "shared_secret must be supplied")
    
    options = add_defaults(options)
    
    const nodes = await this.get_active_nodes()
    log.debug("\r\nNodes: ", nodes)

    const number_of_nodes = nodes.length
    const threshold = this.threshold_fun(number_of_nodes)
    log.debug(`Nodes: ${number_of_nodes} Threshold: ${threshold}`)
    const shares = secrets.share(this.b64_to_hex(shared_secret), number_of_nodes, threshold)

    log.debug("Shares: ", shares)

    const keys = this.get_config_keys()

    const payload = nodes.map(node => {
      const public_key = node.node_key

      log.debug(`\r\nNode ${node.owner}`)

      const share = eosjs_ecc.Aes.encrypt(keys.private , public_key, shares.pop())
      
      return {
        node: node.owner, 
        message: share.message.toString('hex'),
        nonce: String(share.nonce),
        checksum: share.checksum,
        public_key: public_key,
      }
    })
    const data = {
      data: payload,
      threshold: threshold,
      public_key: keys.public,
    }
    log.debug("\r\nBundling... ")
    log.debug("Constructed this (data): ", JSON.stringify(data))
    log.debug("this.config.priveosContract: ", this.config.priveosContract)
    log.debug("this.config.dappContract: ", this.config.dappContract)
    log.debug("owner: ", owner)
    let actions = options.actions
    
    if(!this.contractpays) {
      const fee = await this.get_store_fee(options.token_symbol)
      const balance = await this.get_user_balance(owner, options.token_symbol)
      if(fee.amount > balance.amount) {
        const transfer_amount = fee.sub(balance)
        actions = actions.concat([
          {
            account: this.config.priveosContract,
            name: 'prepare',
            authorization: [{
              actor: owner,
              permission: 'active',
            }],
            data: {
              user: owner,
              currency: String(options.token_symbol),
            }
          },
          {
            account: "eosio.token",
            name: 'transfer',
            authorization: [{
              actor: owner,
              permission: 'active',
            }],
            data: {
              from: owner,
              to: this.config.priveosContract,
              quantity: String(transfer_amount),
              memo: "PrivEOS fee",
            }
          }
        ])
      }
    }
    
    
    var buffer = Buffer.from(JSON.stringify(data))
    const hash = await getMultiHash(buffer)
    log.debug("Calling /broker/store/ for hash ", hash)
    const response = await axios.post(this.config.brokerUrl + '/broker/store/', {
      file: file,
      data: JSON.stringify(data),
      owner: owner,
      dappcontract: this.config.dappContract,
      timeout_seconds: this.config.timeout_seconds,
    })
    
    actions = actions.concat([
      {
        account: this.config.priveosContract,
        name: 'store',
        authorization: [{
          actor: owner,
          permission: 'active',
        }],
        data: {
          owner: owner,
          contract: this.config.dappContract,
          file: file,
          data: hash,
          token: String(options.token_symbol),
          auditable: this.auditable,
          contractpays: this.contractpays,
        }
      }
    ])
    return await this.eos.transaction({actions})
  } 
  
  async accessgrant(user, file, options={}) {
    options = add_defaults(options)
    log.debug(`accessgrant user: ${user}`)
    let actions = []
    if(options.actions) {
      actions = options.actions
    }
    if(!this.contractpays) {
      const fee = await this.get_read_fee(options.token_symbol)
      const balance = await this.get_user_balance(user, options.token_symbol)
      if(fee.amount > balance.amount) {
        const transfer_amount = fee.sub(balance)
        actions = actions.concat([
          {
            account: this.config.priveosContract,
            name: 'prepare',
            authorization: [{
              actor: user,
              permission: 'active',
            }],
            data: {
              user: user,
              currency: String(options.token_symbol),
            }
          },
          {
            account: "eosio.token",
            name: 'transfer',
            authorization: [{
              actor: user,
              permission: 'active',
            }],
            data: {
              from: user,
              to: this.config.priveosContract,
              quantity: String(transfer_amount),
              memo: "PrivEOS fee",
            }
          }
        ])
      }
    }
    actions = actions.concat(
      [
        {
          account: this.config.priveosContract,
          name: 'accessgrant',
          authorization: [{
            actor: user,
            permission: 'active',
          }],
          data: {
            user: user,
            contract: this.config.dappContract,
            file,
            public_key: this.config.ephemeralKeyPublic,
            token: String(options.token_symbol),
            contractpays: this.contractpays,
          }
        }
      ]
    )
    return this.eos.transaction({actions})
  }
  
  async get_read_fee(token) {
    const res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'readprice', limit:1, lower_bound: token.name})
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return new Asset(res.rows[0].money)
  }
  
  async get_store_fee(token) {
    const res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'storeprice', limit:1, lower_bound: token.name})
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return new Asset(res.rows[0].money)
  }
  
  async get_user_balance(user, token) {
    const res = await this.eos.getTableRows({json:true, scope: user, code: 'priveosrules',  table: 'balances', limit:1})
    const bal = res.rows[0]
    if(bal) {
      return new Asset(bal.funds)
    } else {
      return new Asset(0, token)
    }
  }

  async read(owner, file) {
    const response = await axios.post(this.config.brokerUrl + '/broker/read/', {
      file: file,
      requester: owner,
      dappcontract: this.config.dappContract,
      timeout_seconds: this.config.timeout_seconds,
    })
    const shares = response.data
    log.debug("Shares: ", shares)
    
    const read_key = this.get_config_keys()
    
    const decrypted_shares = shares.map((data) => {
      return String(eosjs_ecc.Aes.decrypt(read_key.private, data.public_key, data.nonce, Buffer.from(data.message, 'hex'), data.checksum))
    })
    return this.hex_to_b64(secrets.combine(decrypted_shares))
  }
  
  async get_active_nodes(){
    const res = await this.eos.getTableRows({json:true, scope: this.config.priveosContract, code: this.config.priveosContract,  table: 'nodes', limit:100})
    return res.rows.filter(x => x.is_active)
  }
  
  /**
   * Return the keys passed when instantiating priveos
   */
  get_config_keys() {
    if(this.config.ephemeralKeyPublic && this.config.ephemeralKeyPrivate) {
      return {
        public: this.config.ephemeralKeyPublic,
        private: this.config.ephemeralKeyPrivate,
      }
    } else {
      return {
        public: this.config.publicKey,
        private: this.config.privateKey,
      }
    }
  }
  
  async check_chain_id() {
    const info = await this.eos.getInfo({})
    if(info.chain_id != this.config.chainId) {
      console.error(`Error: Chain ID is configured to be "${this.config.chainId}" but is "${info.chain_id}"`)
      if(process && process.exit) {
        process.exit(1)        
      }
    }
  }
  
  b64_to_hex(string) {
    return Buffer.from(string, 'base64').toString('hex')
  }
  
  hex_to_b64(string) {
    return Buffer.from(string, 'hex').toString('base64')
  }
}

// Add some static functions

Priveos.default_threshold_fun = (N) => {
  return Math.floor(N/2) + 1
}

Priveos.encryption = require('./encryption')

