// make sure you start 2 grapes
// grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
// grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'

'use strict'

const Grenache = require('./../')
const Link = require('grenache-nodejs-link')
const PeerSub = Grenache.PeerSub

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerSub(link, {})
peer.init()

peer.sub('pub_test', { timeout: 10000 })

peer.on('connected', () => {
  console.log('connected')
})

peer.on('disconnected', () => {
  console.log('disconnected')
})

peer.on('message', (msg) => {
  console.log(msg)
})
