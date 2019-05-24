const axios = require('axios')
const Priveos = require('./index')

jest.mock('axios')

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



jest.mock('axios')
const originalShares = {
  data: {
    "shares": [
      {
        "message": "A2re1xn49jfUTgoI7NzbllIj4Kc8MS/HltDr961lQiCldcGc+Yz3xc+g48ah2rnceNd+lygEAHcDJRFkNHkSxUysYIjWQXDL1eTFYRYyR3V4z9YO6k8B8aRPP3Ug64mIDkqRRhE6Yp4QRh4sryB+I25jSk1so8NZCrDg1TvjpSfGDE1dIkIihZv5XqnFrlgBiJ0tjh4iYb24c0JFIof75O52qGRX1P5770Ds/downZJAf4E5IV7UGM9JSCcP84LPYRexpaBxx3lFpeK73F5aE6krXzd7TWGZ7nHUd4UZ/Ok9nkA/1e2m04eLCWml1DEcQU+HkkYFIR4XenX07LeTvqHuPdekyw8=",
        "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
      },
      {
        "message": "4MmHkhWju+BUGCmWI1udM5fbvOiVanTPDNbLtxngVwLACqoNEwuA3VR79DMNHcOt3t2YZoMP6xx341qefZ4ekjpTZQccS/BUUZIspPHofcsOHEaVtDU8Bx0c9kc/yyBmWwXq9VUOS4kiN+HFJUkeXP/JTWuKUsjAL6BCqupjvemL0mX6/X7EWC7E/uDBmDewxE22CWeueq/Mfs8XyTHJYlvoau8wJ553ENPCta0M0p401JOFYN73ZIaPtAtlKx6VRMA61Z09YUZltvVNokLrbgBmhNA4NWznwP+QXZd2qLg/1IYLviphY9TBbJ3aU2sy2a6VK5KXi+o7UDIZr1oTsrWQBnhgDyg=",
        "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
      },
      {
        "message": "27jjpYbHBRXwPxJJjY8SrWmjXIHyP1ck70lo+ofrlh32IJwQeY9ryTJMnXiXFbiBZvYlxjtZ42+HT88l+jQ5HLX8WITx3wxYmPfxHtcfWYdFOHO811FfK/cAVGuYa45RINJMIv/9bsI5KiHODw5qEhDz9AHwxeAl2k349e0ZsuoJxCqJqq/kopMufxylnyeCWm5M9nr7ALkWtCMqIlpiYvg0rdNmpgbvRYe+X+kxTPF40eJgt5MkPmFB09BgAVgniWvh1nl1x7gwHq/1X+WdGvB4OoDkUpbnGDFYh64cYq2refFuKryHhezD/0htlC+3oog4BMiDTeGzpEEzIT+VQl3G4HYEwlg=",
        "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
      }
    ],
    "user_key": "EOS6Zy532Rgkuo1SKjYbPxLKYs8o2sEzLApNu8Ph66ysjstARrnHm"
  }
}

const fakeShare = {
  "message": "0Z4XL17RN96IAfgECwOBB1YwU0LYWAPZyT6WvwLEb8kZPCp3aSIpC+wFNFh8WHicNnREJQF2VUvk6pwT7ziGeMRVYxdd7T0GbQKeH4hTRvKytP73ConSCGtvtwLVQxd2SOhVXFmwS4zvBeERg7k9K2wmz/jl879W0OVVVPs4yESrN0O/9htH/hWmrk0eDVUwaZUmBG9n6r4Gjmv4fQlPSO363n1rjz4dWoMASPc1i2HFnNjJnyex29JGY5B3wDTz+U1NsOGJXuIhZb1PE0q8tYYYUWMPZSS0C7zN8vDp27L4EGLAQmdJVhnvvT2STSDWtg0rhxfMgqyitrviLo8ylKlE+SCecec=",
  "node_key": "EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV"
}



// privateKey: '5JqvAdD1vQG3MRAsC9RVzdPJxnUCBNVfvRhL7ZmQ7rCqUoMGrnw',
// publicKey: 'EOS87xyhE6czLCpuF8PaEGc3UiXHHyCMQB2zHygpEsXyDJHadHWFK',
const ephKeysReader = {
  private: '5JHBkNSdn5QFnXVNi9RTTVFvSafk4A8B99oVKANbue1RZseKpwt',
  public: 'EOS82FXAs614bmp7q9s55kyuDCHniATGwxEm4DenDxf1fnVEjVunj'
}

const fakeShares = originalShares


axios.post.mockResolvedValue(originalShares)

describe("Priveos", () => {
  let priveos = null
  beforeEach(() => {
    priveos = new Priveos({
      privateKey: '5JHBkNSdn5QFnXVNi9RTTVFvSafk4A8B99oVKANbue1RZseKpwt',
      publicKey: 'EOS82FXAs614bmp7q9s55kyuDCHniATGwxEm4DenDxf1fnVEjVunj',
      dappContract: 123,
      brokerUrl: 123,
      chainId: "3a953df32658a2c7ef97c4048acb255969e803dafd92b96755bbc90ce4d1e448",
      httpEndpoint: 'https://123456789abcdefghijklmnop'
    })
  })

  describe("#read", () => {
    test('should throw error when cipher is non-sense', async () => {
      const result = await priveos.read("owner", "file_id", "tx_id")
      expect(result).toEqual(new Uint8Array([7,197,89,245,11,154,56,255,28,179,39,92,182,51,245,101,2,110,88,103,234,230,147,134,44,34,236,153,71,55,154,40]))
    })
  })
})
