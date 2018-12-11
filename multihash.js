import {default as Unixfs} from 'ipfs-unixfs'
import {DAGNode, util} from 'ipld-dag-pb'
import multihash from 'multihashes'

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
                  resolve(multihash.toB58String(cid.multihash)) 
                }
              })
            }
        })
    })
}
