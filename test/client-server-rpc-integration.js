/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const parallel = require('async/parallel')
const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerRPCClient')

let rpc, grape
describe('RPC integration', () => {
  before(function (done) {
    this.timeout(6000)
    grape = spawn(path.join(__dirname, 'boot-grape.sh'), { detached: true, inherit: 'stdio' })
    setTimeout(() => {
      const f = path.join(__dirname, '..', 'examples', 'rpc_server.js')
      rpc = spawn('node', [ f ], { detached: true })
      done()
    }, 5000)
  })

  after(function (done) {
    this.timeout(5000)
    rpc.on('close', () => {
      done()
    })

    grape.on('close', () => {
      process.kill(-rpc.pid)
    })

    process.kill(-grape.pid)
  })

  it('messages with the rpc worker', (done) => {
    const link = new Base.Link({
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

    setTimeout(() => {
      parallel(tasks, (err, data) => {
        if (err) throw err
        assert.equal(data[0][0], 'world')
        assert.equal(data.length, 5)
        done()
      })
    }, 5000)
  }).timeout(15000)
})
