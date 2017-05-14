'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerPub')
const _ = require('lodash')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new Peer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function() {
  link.announce('pub_test', service.port, {})
}, 1000)

setInterval(() => {
  service.pub('world')
}, 100)
