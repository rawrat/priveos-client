import ByteBuffer from 'bytebuffer'


export function get_threshold(N) {
  return Math.floor(N/2) + 1
}

export function hex_to_uint8array(hex_string) {
  return new Uint8Array(ByteBuffer.fromHex(hex_string).toArrayBuffer())
}

export function uint8array_to_hex(array) {
  return Buffer.from(array).toString('hex')
}