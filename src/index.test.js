const axios = require('axios')
const Priveos = require('./index')
jest.mock('axios')

const originalShares = {
  "shares": [
    { 
      "message": "0Z4XL17RN96IAfgECwOBB1YwU0LYWAPZyT6WvwLEb8kZPCp3aSIpC+wFNFh8WHicNnREJQF2VUvk6pwT7ziGeMRVYxdd7T0GbQKeH4hTRvKytP73ConSCGtvtwLVQxd2SOhVXFmwS4zvBeERg7k9K2wmz/jl879W0OVVVPs4yESrN0O/9htH/hWmrk0eDVUwaZUmBG9n6r4Gjmv4fQlPSO363n1rjz4dWoMASPc1i2HFnNjJnyex29JGY5B3wDTz+U1NsOGJXuIhZb1PE0q8tYYYUWMPZSS0C7zN8vDp27L4EGLAQmdJVhnvvT2STSDWtg0rhxfMgqyitrviLo8ylKlE+SCecec=",
      "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
    },
    {
      "message": "jupxWx+WGBY9JLM7cQYJLnYE4Zt8D4sZ/lRUQ8vMfg0OstQuTEKf7xFsM06ENSHrj2vUpKexy05THPPEKNNX5hYgwADjE2EsXsRq/0kPntXth6+mxTuBZc9VTssRpGD6CdockEp5qMoppkbYr2i5KlxcoJx3vqY61LS+lCmFSN8YxCtMZq2S0VCUTIOWiBqr/ewQvwlbNfsH8OfRYxMbjXqUj36JZyMpNFrJVdWhI+bP51sbKP5eyGH5wUdPSgTIC/XjZi+aFk3/8wOiWbfmS4ZtgeMZQtVWjoQga2zSMAGEk7mia3HpX5u2pXcvAHKydf/BMilUBZZ2IjgsSyo06GCRTtwdfZc=",
      "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
    },
    {
      "message": "9I6aup/UJBeusoD4oD+uUSkDjNXgxJVnToW6+LBKtd/fmkMYryacSlOgNo3qHIvO65Qo9Mfqwj65TLGsgp6NKLCZfJo92F/OOQ5BqPllBwchBXGbgOAm8RRz7+IW15NA6f59f863ZbUzIR9FcWgSQVIFluswkL2X3eRvKqtMI75fwmQLLHkB/eslDgwpxM0DkhkW6JFo9ps3kihs/FGGblbARFeARY/T+BnEFuN42JG8FIQ2imVn9ckv0cul+NsTaA9WR+1k440qpSmKLYm43vqjHjC726LkvsDc1sGs/6mLniRu93DpSsXlpMqEcuJw8+ApPqDCosJ5+6EOMEHY8UjSr/PErhc=",
      "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
    }
  ],
  "user_key": "EOS6Zy532Rgkuo1SKjYbPxLKYs8o2sEzLApNu8Ph66ysjstARrnHm"
}
axios.post.mockResolvedValue(() => Promise.resolve(originalShares))



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
      httpEndpoint: '123'
    })).not.toThrow()
  })
})

describe("Priveos#read", () => {
  let priveos = null
  beforeEach(() => {
    priveos = new Priveos({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123,
      brokerUrl: 123,
      chainId: "3a953df32658a2c7ef97c4048acb255969e803dafd92b96755bbc90ce4d1e448",
      httpEndpoint: '123'
    })
  })
  
  test('throws error on wrong share', () => {
    priveos.read({
      privateKey: 123,
      publicKey: 123,
      ephemeralKeyPrivate: 123,
      ephemeralKeyPublic: 123,
      dappContract: 123,
      brokerUrl: 123,
      chainId: "3a953df32658a2c7ef97c4048acb255969e803dafd92b96755bbc90ce4d1e448",
      httpEndpoint: '123'
    }, '123', '123')
  })
})