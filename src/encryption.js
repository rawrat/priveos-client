const { secretbox, randomBytes } = require("tweetnacl/nacl-fast")
const Bourne = require('@hapi/bourne')
const assert = require('assert')
const eosjs_ecc_priveos = require('eosjs-ecc-priveos')

export function generateKey() {
  return randomBytes(secretbox.keyLength)
}

function generateNonce() {
  return randomBytes(secretbox.nonceLength)
}

export function encrypt(messageUint8Array, keyUint8Array) {
  if(!keyUint8Array) {
    throw new Error("Please specify a key as second argument")
  }
  const nonce = generateNonce()
  const box = secretbox(messageUint8Array, nonce, keyUint8Array)

  const fullMessageUInt8Array = new Uint8Array(nonce.length + box.length)
  fullMessageUInt8Array.set(nonce)
  fullMessageUInt8Array.set(box, nonce.length)
  return fullMessageUInt8Array
}

export function decrypt(messageWithNonceUint8Array, keyUint8Array) {
  const nonce = messageWithNonceUint8Array.slice(0, secretbox.nonceLength)
  const message = messageWithNonceUint8Array.slice(
    secretbox.nonceLength,
    messageWithNonceUint8Array.length
  )

  const decrypted = secretbox.open(message, nonce, keyUint8Array)

  if (!decrypted) {
    throw new Error("Could not decrypt message")
  }
  return decrypted
}

export function unpack_share(share, ownerPubKey, readerKeyPair) {
  try {
      const base = Buffer.from(share.message, 'base64')
      const decrypted = eosjs_ecc_priveos.Aes.decrypt(readerKeyPair.private, share.node_key, base)
      const {s: signature, m: message} = Bourne.parse(String(decrypted))
      assert(eosjs_ecc_priveos.verify(signature, message, ownerPubKey), `Node ${share.node_key}: Invalid signature. Data is not signed by ${ownerPubKey}.`)
      return message
  } catch(e) {
      throw new Error(e) // TODO remove this line for backwards compatibility in client (see lines below)
      // old format (v0.1.4 and lower)
      // REMOVE_WHEN_MAINNET
      // old files don't contain a signature, so we cannot check it
      // this is just here temporarily to ensure a smooth transistion
      // as soon as a sufficient number of nodes have upgraded, we can remove this try/catch and declare old files as testnet history
  }
}