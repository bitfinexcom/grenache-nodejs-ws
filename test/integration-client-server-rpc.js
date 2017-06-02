/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const parallel = require('async/parallel')
const Peer = require('./../').PeerRPCClient
const Link = require('./../').Link
const { bootTwoGrapes } = require('./helper')

let rpc, grapes
describe('RPC integration', () => {
  before(function (done) {
    this.timeout(8000)

    grapes = bootTwoGrapes()
    grapes[0].once('announce', (msg) => {
      done()
    })

    grapes[1].on('ready', () => {
      const f = path.join(__dirname, '..', 'examples', 'rpc_server.js')
      rpc = spawn('node', [ f ])
    })
  })

  after(function (done) {
    this.timeout(5000)
    rpc.on('close', () => {
      done()
    })
    grapes[0].stop(() => {})
    grapes[1].stop(() => {})
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
