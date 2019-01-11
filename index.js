'use strict'
import nacl from 'tweetnacl'
import secrets from 'secrets.js-grempe'
import util from 'tweetnacl-util'
nacl.util = util
import assert from 'assert'
import axios from 'axios'
axios.defaults.timeout = 2500;
import ByteBuffer from 'bytebuffer'
import eosjs_ecc from 'eosjs-ecc'
import { get_threshold, hex_to_uint8array, asset_to_amount } from './helpers.js'
import Eos from 'eosjs'
import getMultiHash from './multihash'
const log = require('loglevel')

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
    log.setDefaultLevel(config.logLevel || 'info')
    
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
   * Generate a new symmetric secret + nonce to encrypt files
   */
  get_encryption_keys() {
    const secret_bytes = nacl.randomBytes(nacl.secretbox.keyLength)
    const nonce_bytes = nacl.randomBytes(nacl.secretbox.nonceLength)
    log.debug("Secret (bytes): ", JSON.stringify(secret_bytes))
    log.debug("Nonce (bytes): ", JSON.stringify(nonce_bytes))
    return {
      secret_bytes,
      nonce_bytes
    }
  }

  /**
   * Trigger a store transaction at priveos level alongside the passed actions
   * @param {string} owner 
   * @param {string} file 
   * @param {Uint8Array} secret_bytes 
   * @param {Uint8Array} nonce_bytes 
   * @param {array} actions Additional actions to trigger alongside store transaction (usability)
   */
  async store(owner, file, secret_bytes, nonce_bytes, token_symbol, actions = []) {
    log.debug(`\r\n###\r\npriveos.store(${owner}, ${file})`)
    
    assert.ok(owner && file, "Owner and file must be supplied")
    assert.ok(secret_bytes && nonce_bytes, "secret_bytes and nonce_bytes must be supplied (run priveos.get_encryption_keys() before)")

    const secret = Buffer.from(secret_bytes).toString('hex')
    const nonce = Buffer.from(nonce_bytes).toString('hex')
    const shared_secret = secret + nonce

    log.debug("shared_secret: ", shared_secret)
    log.debug("Secret: ", secret)
    log.debug("Nonce: ", nonce)
    log.debug("shared_secret: ", shared_secret)
    
    const nodes = await this.get_active_nodes()
    log.debug("\r\nNodes: ", nodes)

    const number_of_nodes = nodes.length
    const threshold = get_threshold(number_of_nodes)
    log.debug(`Nodes: ${number_of_nodes} Threshold: ${threshold}`)
    const shares = secrets.share(shared_secret, number_of_nodes, threshold)

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
    const fee = await this.get_store_fee(token_symbol)
    if(asset_to_amount(fee) > 0) {
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
            currency: token_symbol,
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
            quantity: fee,
            memo: "PrivEOS fee",
          }
        }
      ])
    }
    
    
    var buffer = Buffer.from(JSON.stringify(data))
    const hash = await getMultiHash(buffer)
    log.debug("Calling /broker/store/ for hash ", hash)
    const response = await axios.post(this.config.brokerUrl + '/broker/store/', {
      file: file,
      data: JSON.stringify(data),
      owner: owner,
      dappcontract: this.config.dappContract,
    })
    
  
    const result = await this.eos.transaction(
      {
        actions: actions.concat([
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
              token: token_symbol,
              auditable: 0,
            }
          }
        ])
      }
    )
    
    return result
  } 
  
  async accessgrant(user, file, token_symbol, actions = []) {
    log.debug(`accessgrant user: ${user}`)
    const fee = await this.get_read_fee(token_symbol)
    if(asset_to_amount(fee) > 0) {
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
            currency: token_symbol,
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
            quantity: fee,
            memo: "PrivEOS fee",
          }
        }
      ])
    }      
    return this.eos.transaction({
      actions: actions.concat(
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
              token: token_symbol,
            }
          }
        ]
      )
    })
  }
  
  async get_read_fee(token) {
    if(token.indexOf(",") != -1) {
      token = token.split(",")[1]
    }
    const res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'readprice', limit:1, lower_bound: token})
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return res.rows[0].money
  }
  
  async get_store_fee(token) {
    if(token.indexOf(",") != -1) {
      token = token.split(",")[1]
    }
    const res = await this.eos.getTableRows({json:true, scope: 'priveosrules', code: 'priveosrules',  table: 'storeprice', limit:1, lower_bound: token})
    log.debug('get_priveos_fee: ', res.rows[0].money)
    return res.rows[0].money
  }

  async read(owner, file) {
    const response = await axios.post(this.config.brokerUrl + '/broker/read/', {
      file: file,
      requester: owner,
      dappcontract: this.config.dappContract,
    })
    const shares = response.data
    log.debug("Shares: ", shares)
    
    const read_key = this.get_config_keys()
    
    const decrypted_shares = shares.map((data) => {
      return String(eosjs_ecc.Aes.decrypt(read_key.private, data.public_key, data.nonce, ByteBuffer.fromHex(data.message).toBinary(), data.checksum))
    })
    const combined = secrets.combine(decrypted_shares)
    log.debug("Combined: ", combined)
    const combined_hex_key = combined.slice(0, nacl.secretbox.keyLength*2)
    const combined_hex_nonce = combined.slice(nacl.secretbox.keyLength*2)
    log.debug("Hex key: ", combined_hex_key)
    log.debug("Nonce: ", combined_hex_nonce)
    const key_buffer = hex_to_uint8array(combined_hex_key)
    const nonce_buffer = hex_to_uint8array(combined_hex_nonce)
    return [key_buffer, nonce_buffer]
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
}