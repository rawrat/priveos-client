const Unixfs = require('ipfs-unixfs')
const { DAGNode, util } = require('ipld-dag-pb')

export default function getMultiHash(buffer) {
    const unixFs = new Unixfs("file", buffer)
    return new Promise((resolve, reject) => {
        DAGNode.create(unixFs.marshal(), (err, node) => {
            if(err) {
              reject(err)
            } else {
              util.cid(node, (err, cid) => {
                if(err) {
                  reject(err)
                } else {
                  resolve(cid.toBaseEncodedString()) 
                }
              })
            }
        })
    })
}
