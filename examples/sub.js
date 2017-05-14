'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerSub')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

setTimeout(() => {
  peer.sub('pub_test', { timeout: 10000 }, (err, data) => {
           
  })

  peer.on('message', (msg) => {
    console.log(msg)
  })
}, 2000)
