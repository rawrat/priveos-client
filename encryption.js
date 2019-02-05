import { secretbox, randomBytes } from "tweetnacl/nacl-fast"
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from "tweetnacl-util"

export function generateKey() {
  return encodeBase64(randomBytes(secretbox.keyLength))
}

function generateNonce() {
  return randomBytes(secretbox.nonceLength)
}

export function encrypt(json, key) {
  if(!key) {
    throw new Error("Please specify a key as second argument")
  }
  const keyUint8Array = decodeBase64(key)

  const nonce = generateNonce()
  const messageUint8 = decodeUTF8(JSON.stringify(json))
  const box = secretbox(messageUint8, nonce, keyUint8Array)

  const fullMessage = new Uint8Array(nonce.length + box.length)
  fullMessage.set(nonce)
  fullMessage.set(box, nonce.length)

  const base64FullMessage = encodeBase64(fullMessage)
  return base64FullMessage
}

export function decrypt(messageWithNonce, key) {
  const keyUint8Array = decodeBase64(key)
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce)
  const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength)
  const message = messageWithNonceAsUint8Array.slice(
    secretbox.nonceLength,
    messageWithNonce.length
  )

  const decrypted = secretbox.open(message, nonce, keyUint8Array)

  if (!decrypted) {
    throw new Error("Could not decrypt message")
  }

  const base64DecryptedMessage = encodeUTF8(decrypted)
  return JSON.parse(base64DecryptedMessage)
}

