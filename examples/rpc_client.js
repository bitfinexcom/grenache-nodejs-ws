// make sure you start 2 grapes
// grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
// grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const Peer = Grenache.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const reqs = 100000
let reps = 0

const d1 = new Date()
for (let i = 0; i < reqs; i++) {
  peer.request('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
    if (err) {
      console.error(err)
      process.exit(-1)
    }
    // console.log(data)
    if (++reps === reqs) {
      const d2 = new Date()
      console.log(d2 - d1)
    }
  })
}
