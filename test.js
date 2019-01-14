'use strict'

import assert from 'assert'
import Priveos from './index'
var config
try {
  config = require('./config-test').default
} catch(e) {
  console.log("config-test.js not found. Please copy config-test.js-example to config-test.js and modify to your needs")
  process.exit(1)
}
import uuidv4 from 'uuid/v4'
import eosjs_ecc from 'eosjs-ecc'
const alice = 'priveosalice'
const bob = 'priveosbob11'
import Promise from 'bluebird'
const config_alice = {
  ...config,
  ...{
    privateKey: '5HrReeu6FhGFWiHW7tsvLLN4dm2TDhizP9B7xWi4emG9RmVfLss',
    publicKey: 'EOS6Zy532Rgkuo1SKjYbPxLKYs8o2sEzLApNu8Ph66ysjstARrnHm', 
  }
}


console.log("config_alice: ", JSON.stringify(config_alice))

var file = uuidv4()
if (process.argv[2]) {
  file = process.argv[2]
}
const a = new Date()
console.log(config_alice)
const priveos_alice = new Priveos(config_alice)

async function test() {
  // generate ephemeral key
  const ephemeral_key_private = await eosjs_ecc.randomKey()
  const b = new Date()
  console.log("Time elapsed - random key generation: ", (b-a))
  const ephemeral_key_public = eosjs_ecc.privateToPublic(ephemeral_key_private);
  const config_bob = {
    ...config,
    ...{
      privateKey: '5JqvAdD1vQG3MRAsC9RVzdPJxnUCBNVfvRhL7ZmQ7rCqUoMGrnw',
      publicKey: 'EOS87xyhE6czLCpuF8PaEGc3UiXHHyCMQB2zHygpEsXyDJHadHWFK',
      ephemeralKeyPrivate: ephemeral_key_private,
      ephemeralKeyPublic: ephemeral_key_public,
    }
  }
  const priveos_bob = new Priveos(config_bob)

    // Bob requests access to the file. 
    // This transaction will fail if he is not authorised.

  const { secret_bytes, nonce_bytes } = priveos_alice.get_encryption_keys()
  
  const transaction_data = await priveos_alice.store(alice, file, secret_bytes, nonce_bytes, "4,EOS")
  console.log("Successfully store file. Transaction id: ", transaction_data.transaction_id)
  // throw new Error("ABORT NOW")
  // process.exit(1)
  const c = new Date()
  console.log("\r\nTime elapsed - storing file ", (c-b))
  console.log(`Successfully stored file (${file}), now off to reading.`)
  
  // Bob requests access to the file. 
  // This transaction will fail if he is not authorised.
  console.log(`Push accessgrant action for user ${bob}, contract ${priveos_bob.config.dappContract}, file ${file} and public key ${priveos_bob.config.ephemeralKeyPublic}`)
  await priveos_bob.accessgrant(bob, file, "4,EOS")
  console.log(`\r\nWaiting for transaction to finish`)  
  await Promise.delay(5000) // delay to make sure transaction can propagate
  const d = new Date()
  console.log("\r\nTime elapsed - accessgrant transaction", (d-c))
  
  console.log("Calling riveos_bob.read(bob, file)")
  const [recovered_secret_bytes, recovered_nonce_bytes] = await priveos_bob.read(bob, file)
  console.log("priveos_bob.read(bob, file) succeeded")
  const e = new Date()
  console.log("d-e", (e-d))
  console.log("a-a", (e-a))
  // console.log('Y: ', y)

  console.log("Original key: ", Priveos.uint8array_to_hex(secret_bytes))
  console.log("Original nonce: ", Priveos.uint8array_to_hex(nonce_bytes))
  console.log("Reconstructed key: ", Priveos.uint8array_to_hex(recovered_secret_bytes))
  console.log("Reconstructed nonce: ", Priveos.uint8array_to_hex(recovered_nonce_bytes))
  
  assert.deepStrictEqual(secret_bytes, recovered_secret_bytes)
  assert.deepStrictEqual(nonce_bytes, recovered_nonce_bytes)
  
  console.log("Success!")
}
test()
