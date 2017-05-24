// make sure you start grenache-grape:
// grape --dp 20001 --apw 30001 --aph 40001 --bn "127.0.0.1:20002,127.0.0.1:20003"

'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../../lib/PeerRPCServer')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const opts = {
  secure: {
    key: fs.readFileSync(path.join(__dirname, 'server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'server-crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'ca-crt.pem')),
    requestCert: true,
    rejectUnauthorized: false, // take care, can be dangerous in production!
    verifyClient: (info, cb) => {
      console.log('--verifyClient---->', info.req.socket.getPeerCertificate())

      // cb(true) for success
      // cb(false) for failure
      // eslint-disable-next-line
      cb(true)
    }
  }
}
const peer = new Peer(
  link,
  opts
)
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  handler.reply(null, 'world')
})
