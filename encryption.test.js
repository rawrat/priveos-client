import { generateKey, encrypt, decrypt } from './encryption'

test('normal strings', () => {
  const message = "Alices loves Bob! $øö“”``äÄñç🚀"
  const key = generateKey()
  const encrypted = encrypt(message, key)
  const decrypted = decrypt(encrypted, key)
  expect(decrypted).toStrictEqual(message)
})

test('objects', () => {
  const obj = {x: "Blabla", y: {z: "Ohai"}}
  const key = generateKey()
  const encrypted = encrypt(obj, key)
  const decrypted = decrypt(encrypted, key)
  expect(decrypted).toStrictEqual(obj)
})

test('null object', () => {
  const key = generateKey()
  const encrypted = encrypt(null, key)
  const decrypted = decrypt(encrypted, key)
  expect(decrypted).toBe(null)
})

test('calling without arguments', () => {
  expect(() => {
    encrypt()
  }).toThrow("Please specify a key as second argument")
})


