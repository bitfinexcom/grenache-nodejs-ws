// make sure you start grenache-grape:
// grape --dp 20001 --apw 30001 --aph 40001 --bn "127.0.0.1:20002,127.0.0.1:20003"

'use strict'

const Grenache = require('./../')
const Link = Grenache.Link
const PeerPub = Grenache.PeerPub

const _ = require('lodash')

const link = new Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new PeerPub(link, {})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('pub_test', service.port, {})
}, 1000)

setInterval(() => {
  service.pub('world')
}, 100)
