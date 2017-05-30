/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')
const Grape = require('grenache-grape').Grape

const parallel = require('async/parallel')
const Peer = require('./../').PeerRPCClient
const Link = require('./../').Link

let rpc, grape1, grape2
describe('RPC integration', () => {
  before(function (done) {
    this.timeout(6000)

    grape1 = new Grape({
      dht_port: 20002,
      dht_bootstrap: [ '127.0.0.1:20001', '127.0.0.1:20003' ],
      api_port: 40001,
      api_port_http: 40002
    })

    grape1.start(() => {})

    grape2 = new Grape({
      dht_port: 20001,
      dht_bootstrap: [ '127.0.0.1:20002', '127.0.0.1:20003' ],
      api_port: 30001,
      api_port_http: 30002
    })

    grape2.start(() => {})

    grape1.once('announce', () => {
      done()
    })

    const f = path.join(__dirname, '..', 'examples', 'rpc_server.js')
    rpc = spawn('node', [ f ])
  })

  after(function (done) {
    this.timeout(5000)
    rpc.on('close', () => {
      done()
    })
    grape1.stop(() => {})
    grape2.stop(() => {})
    rpc.kill()
  })

  it('messages with the rpc worker', (done) => {
    const link = new Link({
      grape: 'ws://127.0.0.1:30001'
    })
    link.start()

    const peer = new Peer(link, {})
    peer.init()

    const reqs = 5
    const tasks = []

    function createTask () {
      return function task (cb) {
        peer.map('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
          cb(err, data)
        })
      }
    }

    for (let i = 0; i < reqs; i++) {
      tasks.push(createTask())
    }

    link.on('connect', () => {
      parallel(tasks, (err, data) => {
        if (err) throw err
        assert.equal(data[0][0], 'world')
        assert.equal(data.length, 5)
        done()
      })
    })
  }).timeout(15000)
})
