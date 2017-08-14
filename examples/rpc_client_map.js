// make sure you start 2 grapes
// grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
// grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const PeerRPCClient = Grenache.PeerRPCClient

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

const reqs = 10

for (let i = 0; i < reqs; i++) {
  peer.map('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
    console.log(err, data)
  })
}
