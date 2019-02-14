import { secretbox, randomBytes } from "tweetnacl/nacl-fast"

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

