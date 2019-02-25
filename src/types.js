import assert from 'assert'

export class Symbol {
  constructor(a, b){
    if(!b) {
      // a = "4,EOS"
      [this.precision, this.name] = a.split(',')
      this.precision = parseInt(this.precision, 10)      
    } else {
      this.name = a
      this.precision = b
    }
    
    assert.ok(this.name)
    assert.ok(this.precision != undefined)
  }
  
  equals(other) {
    return this.name == other.name && this.precision == other.precision
  }
  
  toString() {
    return `${this.precision},${this.name}`
  }
}

export class Asset {
  constructor(a, b) {
    if(!b) { // parse string
      // a = "12.3456 EOS"
      const [number, name] = a.split(' ')
      this.amount = parseFloat(number)
          
      let precision  
      const [_, digits] = number.split('.') 
      if(!digits) {
        precision = 0
      } else {
        precision = digits.length        
      }

      this.symbol = new Symbol(name, precision)
      
    } else {
    this.amount = a
    this.symbol = b      
    }
  }
  
  toString() {
    return `${this.amount.toFixed(this.symbol.precision)} ${this.symbol.name}`
  }
  
  add(other) {
    assert.deepEqual(this.symbol, other.symbol, "Symbol mismatch")
    return new Asset(this.amount + other.amount, this.symbol)
  }
  
  sub(other) {
    assert.deepEqual(this.symbol, other.symbol, "Symbol mismatch")
    return new Asset(this.amount - other.amount, this.symbol)
  }
}

