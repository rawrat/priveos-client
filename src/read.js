const Bourne = require('@hapi/bourne')
const assert = require('assert')
const eosjs_ecc_priveos = require('eosjs-ecc-priveos')

export function unpack_share(share, ownerPubKey, readerKeyPair) {
    try {
        const base = Buffer.from(share.message, 'base64')
        const decrypted = eosjs_ecc_priveos.Aes.decrypt(readerKeyPair.private, share.node_key, base)
        const {s: signature, m: message} = Bourne.parse(String(decrypted))
        assert(eosjs_ecc_priveos.verify(signature, message, ownerPubKey), `Node ${share.node_key}: Invalid signature. Data is not signed by ${ownerPubKey}.`)
        return message
    } catch(e) {
        throw new Error(e)
        // old format (v0.1.4 and lower)
        // REMOVE_WHEN_MAINNET
        // old files don't contain a signature, so we cannot check it
        // this is just here temporarily to ensure a smooth transistion
        // as soon as a sufficient number of nodes have upgraded, we can remove this try/catch and declare old files as testnet history
    }
}