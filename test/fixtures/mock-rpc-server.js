'use strict'

const uuid = require('uuid').v4()

const Grenache = require('./../../')
const Link = Grenache.Link
const PeerRPCServer = Grenache.PeerRPCServer

const _ = require('lodash')

let RESPONSE = process.argv[2]
if (!RESPONSE) {
  RESPONSE = uuid
}

const link = new Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  handler.reply(null, RESPONSE)
})
