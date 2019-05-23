const Priveos = require('./index')

describe("Constructor initialization", () => {  
  test('requires config object is not null', () => {
    expect(() => new Priveos(null)).toThrow(TypeError("No config given"))
  })
  test('requires config object is not undefined', () => {
    expect(() => new Priveos()).toThrow(TypeError("No config given"))
  })
  test('requires config object is not undefined', () => {
    expect(() => new Priveos()).toThrow(TypeError("No config given"))
  })
  test('requires either privateKey or eos instance', () => {
    expect(() => new Priveos({})).toThrow(TypeError("None of privateKey or eos instance given"))
  })
  test('requires publicKey if privateKey was given', () => {
    expect(() => new Priveos({
      privateKey: 123
    })).toThrow(TypeError("privateKey without publicKey given"))
  })
  test('requires ephemeralKeyPublic if ephemeralKeyPrivate was given', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123
    })).toThrow(TypeError("ephemeralKeyPrivate but no ephemeralKeyPublic given"))
  })
  test('requires dappContract to be given', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123
    })).toThrow(TypeError("No dappContract given"))
  })
  test('requires chainId to be given', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123
    })).toThrow(TypeError("No chainId given"))
  })
  test('requires brokerUrl to be given', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123,
      chainId: 123
    })).toThrow(TypeError("No brokerUrl given"))
  })
  test('requires httpEndpoint to be given', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123,
      brokerUrl: 123,
      chainId: 123
    })).toThrow(TypeError("No httpEndpoint given"))
  })
  test('initializes correctly with all required values', () => {
    expect(() => new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123,
      brokerUrl: 123,
      chainId: "3a953df32658a2c7ef97c4048acb255969e803dafd92b96755bbc90ce4d1e448",
      httpEndpoint: 'https://123456789abcdefghijklmnop'
    })).not.toThrow()
  })
})