// make sure you start grenache-grape:
// grape --dp 20001 --apw 30001 --aph 40001 --bn "127.0.0.1:20002,127.0.0.1:20003"

'use strict'

const Grenache = require('./../')
const Link = Grenache.Link
const Peer = Grenache.PeerSub

const link = new Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

setTimeout(() => {
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
}, 2000)
