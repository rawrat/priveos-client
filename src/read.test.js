const axios = require('axios')
const Read = require('./read')
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


describe("Priveos#read", () => {
  // let priveos = null
  // beforeEach(() => {
  //   priveos = new Priveos({
  //     privateKey: 123,
  //     publicKey: 123,
  //     ephemeralKeyPrivate: 123,
  //     ephemeralKeyPublic: 123,
  //     dappContract: 123,
  //     brokerUrl: 123,
  //     chainId: "3a953df32658a2c7ef97c4048acb255969e803dafd92b96755bbc90ce4d1e448",
  //     httpEndpoint: 'https://123456789abcdefghijklmnop'
  //   })
  // })

  describe("Priveos#unpack_share", () => {
    test('should return the decrypted share when valid', () => {
      const data = Read.unpack_share(originalShares.data.shares[0], originalShares.data.user_key, ephKeysReader)
      expect(data).toBe("80584a6a30a2539f36117ae00019a0e449eb80715e343d8c1de3da5efb81452804c62424d737679c54a1c2befa56928aa66")
    })
    test('should throw error when public key is not valid', () => {
      expect(() => {
        Read.unpack_share({
          message: "===",
          node_key: "x"
        }, originalShares.data.user_key, ephKeysReader)
      }).toThrow("AssertionError [ERR_ASSERTION]: Invalid public key")
    })
    test('should throw error when message is null object', () => {
      expect(() => {
        Read.unpack_share({
          message: null,
          node_key: "x"
        }, originalShares.data.user_key, ephKeysReader)
      }).toThrow("TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type object")
    })
    test('should throw error when cipher is non-sense', () => {
      expect(() => {
        Read.unpack_share({
          message: "===",
          node_key: "x"
        }, originalShares.data.user_key, ephKeysReader)
      }).toThrow("AssertionError [ERR_ASSERTION]: Invalid public key")
    })
  })
})