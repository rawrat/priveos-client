const { generateKey, encrypt, decrypt } = require('./encryption')
const {
  decodeUTF8,
  encodeUTF8,
} = require("tweetnacl-util")

test('normal strings', () => {
  const message = decodeUTF8("Alices loves Bob! $øö“”``äÄñç🚀")
  const key = generateKey()
  const encrypted = encrypt(message, key)
  const decrypted = decrypt(encrypted, key)
  expect(decrypted).toStrictEqual(message)
})

test('objects', () => {
  const obj = decodeUTF8(JSON.stringify({x: "Blabla", y: {z: "Ohai"}}))
  const key = generateKey()
  const encrypted = encrypt(obj, key)
  const decrypted = decrypt(encrypted, key)
  expect(decrypted).toStrictEqual(obj)
})


test('calling without arguments', () => {
  expect(() => {
    encrypt()
  }).toThrow("Please specify a key as second argument")
})


