'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerRPCClient')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const reqs = 100000
let reps = 0

setTimeout(() => {
  const d1 = new Date()
  for (let i = 0; i < reqs; i++) {
    peer.request('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
      console.log(err, data)
      if (++reps === reqs) {
        const d2 = new Date()
        console.log(d2 - d1)
      }
    })
  }
}, 2000)
