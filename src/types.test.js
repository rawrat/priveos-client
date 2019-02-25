import { Symbol, Asset } from './types'

test('Symbol precision', () => {
  let s = new Symbol("4,EOS")
  expect(s.precision).toBe(4)
  
  s = new Symbol("1,EOSXXX")
  expect(s.precision).toBe(1)
  
  s = new Symbol("0,EOS")
  expect(s.precision).toBe(0)

})

test('Symbol name', () => {
  let s = new Symbol("4,EOS")
  expect(s.name).toBe("EOS")
  
  s = new Symbol("1,EOSXXX")
  expect(s.name).toBe("EOSXXX")
})

test('Symbol Instantiation by parameters', () => {
  let s = new Symbol("EOS", 4)
  expect(s.name).toBe("EOS")
  expect(s.precision).toBe(4)  
})

test('Symbol toString()', () => {
  let s = new Symbol("EOS", 4)
  expect(String(s)).toBe("4,EOS")
})


test('Asset from string', () => {
  let s = new Asset("12.34567 EOS")
  expect(String(s)).toBe("12.34567 EOS")
})

test('Asset by parameters', () => {
  let s = new Asset(5, new Symbol("EOS", 4))
  expect(String(s)).toBe("5.0000 EOS")
})

test('Asset addition', () => {
  let a = new Asset("2.0000 EOS")
  let b = new Asset("3.0000 EOS")
  expect(String(a.add(b))).toBe("5.0000 EOS")
})

test('Asset subtraction', () => {
  let a = new Asset("2.0000 EOS")
  let b = new Asset("3.0000 EOS")
  expect(String(a.sub(b))).toBe("-1.0000 EOS")
})

