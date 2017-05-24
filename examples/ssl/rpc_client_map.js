// make sure you start grenache-grape:
// grape --dp 20001 --apw 30001 --aph 40001 --bn "127.0.0.1:20002,127.0.0.1:20003"

'use strict'

const Base = require('grenache-nodejs-base')
const Peer = require('./../../lib/PeerRPCClient')
const fs = require('fs')
const path = require('path')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})

link.start()

const secure = {
  key: fs.readFileSync(path.join(__dirname, 'client1-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'client1-crt.pem')),
  ca: fs.readFileSync(path.join(__dirname, 'ca-crt.pem')),
  rejectUnauthorized: false // take care, can be dangerous in production!
}

const peer = new Peer(
  link,
  { secure: secure }
)

peer.init()

const reqs = 10

setTimeout(() => {
  for (let i = 0; i < reqs; i++) {
    peer.map('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
      console.log(err, data)
    })
  }
}, 2000)
