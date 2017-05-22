'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerRPCClient')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const reqs = 10

setTimeout(() => {
  for (let i = 0; i < reqs; i++) {
    peer.map('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
      console.log(err, data)
    })
  }
}, 2000)
