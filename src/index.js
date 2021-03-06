'use strict'
const secrets = require('secrets.js-grempe')
const assert = require('assert')
const axios = require('axios')
const eosjs_ecc_priveos = require('eosjs-ecc-priveos')
const Eos = require('eosjs')
const getMultiHash = require('./multihash')
const { Symbol, Asset } = require('./types')

const log = require('loglevel')


const default_options = {
  token_symbol: new Symbol("4,EOS"),
  actions: [],
}

function add_defaults(options) {
  return Object.assign(default_options, options)
}

class Priveos {
  constructor(config) {
    if (!config) throw new Error('Instantiating Priveos requires config object')
    if (!config.privateKey && !config.eos) throw new Error('Instantiating Priveos requires either config.privateKey or config.eos proxy instance (e.g. scatter)')
    if (config.privateKey && !config.publicKey) throw new Error('When passing config.privateKey the related config.publicKey must be present too')
    if (config.ephemeralKeyPrivate && !config.ephemeralKeyPublic) throw new Error('When passing config.ephemeralKeyPrivate the related config.ephemeralKeyPublic must be present too')
    if (!config.dappContract) throw new Error('Instantiating Priveos requires a dappContract set')
    if (!config.chainId) throw new Error('No chainId given')
    if (!config.brokerUrl) throw new Error('No brokerUrl given')
    if (!config.httpEndpoint) throw new Error('No httpEndpoint give')
    if (!config.eos) throw new Error("No eos API instance given")
    
    this.config = config

    if(this.config.threshold_fun) {
      this.threshold_fun = this.config.threshold_fun
    } else {
      this.threshold_fun = Priveos.default_threshold_fun
    }
    
    this.eos = this.config.eos
    this.rpc = this.config.rpc
    
    if(this.config.auditable) {
      if(this.rpc) {
        this.auditable = true
      } else {
        this.auditable = 1
      }
    } else {
      if(this.rpc) {
        this.auditable = false
      } else {
        this.auditable = 0
      }
    }
    
    if(this.config.contractpays) {
      if(this.rpc) {
        this.contractpays = true
      } else {
        this.contractpays = 1
      }
    } else {
      if(this.rpc) {
        this.contractpays = false
      } else {
        this.contractpays = 0
      }
    }
    
    if(typeof this.config.timeout_seconds == 'undefined') {
      this.config.timeout_seconds = 10
    }
    
    // log.setDefaultLevel(this.config.logLevel || 'info')
    log.setLevel(this.config.logLevel || 'info') // required to act according config

    
    
    
    if(!this.config.priveosContract) {
      this.config.priveosContract = 'priveosrules'
    }
    
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

    if (nodes.length == 0) {
      const msg = "No nodes available on priveos network."
      log.error(msg)
      throw msg
    }
    log.debug("\r\nNodes: ", nodes)
    const number_of_nodes = nodes.length
    const threshold = this.threshold_fun(number_of_nodes)
    log.debug(`Nodes: ${number_of_nodes} Threshold: ${threshold}`)
    const hex_secret = Priveos.uint8array_to_hex(shared_secret)
    const shares = secrets.share(hex_secret, number_of_nodes, threshold)

    log.debug("Shares: ", shares)

    const keys = this.get_config_keys()

    const payload = nodes.map(node => {
      const node_key = node.node_key

      log.debug(`\r\nNode ${node.owner}`)
      const message = shares.pop()
      
      const sig = eosjs_ecc_priveos.sign(message, keys.private)
      const data = {
        s: sig,
        m: message,
      }
      let share = eosjs_ecc_priveos.Aes.encrypt(keys.private , node_key, JSON.stringify(data))
      share = share.toString('base64')
      return {
        node: node.owner, 
        share,
        node_key,
      }
    })
    const data = {
      data: payload,
      threshold: threshold,
      user_key: keys.public,
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
    log.info("Submitting the following data to broker: ", JSON.stringify(data, null, 2))
    const url = new URL('/broker/store/', this.config.brokerUrl).href
    
    const response = await axios.post(url, {
      file: file,
      data: JSON.stringify(data),
      owner: owner,
      dappcontract: this.config.dappContract,
      timeout_seconds: this.config.timeout_seconds,
      chainId: this.config.chainId,
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
    if(typeof this.eos.transact !== 'undefined') {
      return await this.eos.transact({actions}, {
        blocksBehind: 3,
        expireSeconds: 30,
      })
    } else {
      return await this.eos.transaction({actions})
    }
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
    let res
    if(typeof this.eos.transact !== 'undefined') {
      res = await this.eos.transact({actions}, {
        blocksBehind: 3,
        expireSeconds: 30,
      })
    } else {
      res = await this.eos.transaction({actions})
    }
    return res.transaction_id
  }
  
  async get_read_fee(token) {
    let res
    if(this.rpc) {
      res = await this.rpc.get_table_rows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'readprice', limit:1, lower_bound: token.name})
    } else {
      res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'readprice', limit:1, lower_bound: token.name})
    }
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return new Asset(res.rows[0].money)
  }
  
  async get_store_fee(token) {
    let res
    if(this.rpc) {
      res = await this.rpc.get_table_rows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'storeprice', limit:1, lower_bound: token.name})
    } else {
      res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'storeprice', limit:1, lower_bound: token.name})
    }
    
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return new Asset(res.rows[0].money)
  }
  
  async get_user_balance(user, token) {
    let res
    if(this.rpc) {
      res = await this.rpc.get_table_rows({json:true, scope: user, code: 'priveosrules',  table: 'balances', limit:1})
    } else {
      res = await this.eos.getTableRows({json:true, scope: user, code: 'priveosrules',  table: 'balances', limit:1})
    }
    const bal = res.rows[0]
    if(bal) {
      return new Asset(bal.funds)
    } else {
      return new Asset(0, token)
    }
  }

  async read(owner, file, txid) {
    const data = {
      file: file,
      requester: owner,
      dappcontract: this.config.dappContract,
      txid,
      timeout_seconds: this.config.timeout_seconds,
      chainId: this.config.chainId,
    }
    const url = new URL('/broker/read/', this.config.brokerUrl).href
    const response = await axios.post(url, data)
    const {shares, user_key} = response.data
    const read_key = this.get_config_keys()
    
    const decrypted_shares = shares.map((data) => { 
      log.debug("data: ", JSON.stringify(data, null, 2))     
      const decrypted = eosjs_ecc_priveos.Aes.decrypt(read_key.private, data.node_key, Buffer.from(data.message, 'base64'))
      const {s: signature, m: message} = JSON.parse(decrypted)    
      assert(eosjs_ecc_priveos.verify(signature, message, user_key), `Node ${data.node_key}: Invalid signature. Data is not signed by ${user_key}.`)
      return message
    })
    const combined = secrets.combine(decrypted_shares)
    return Priveos.hex_to_uint8array(combined)
  }
  
  async get_active_nodes(){
    let res 
    if(this.rpc) {
      res = await this.rpc.get_table_rows({json:true, scope: this.config.priveosContract, code: this.config.priveosContract,  table: 'nodes', limit:100})
    } else {
      res = await this.eos.getTableRows({json:true, scope: this.config.priveosContract, code: this.config.priveosContract,  table: 'nodes', limit:100})
    }
    
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
  

}

// Add some static functions

Priveos.default_threshold_fun = (N) => {
  return Math.floor(N/2) + 1
}
Priveos.hex_to_uint8array = (hex_string) => {
  return new Uint8Array(Buffer.from(hex_string, 'hex'))
}
Priveos.uint8array_to_hex = (array) => {
  return Buffer.from(array).toString('hex')
}

Priveos.encryption = require('./encryption')
Priveos.eosjs_ecc = eosjs_ecc_priveos

module.exports = Priveos
if(typeof window !== 'undefined') {
  window.Priveos = Priveos
}
