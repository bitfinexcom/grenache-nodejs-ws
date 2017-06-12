/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const parallel = require('async/parallel')
const _ = require('lodash')

const PeerRPCClient = require('./../').PeerRPCClient
const Link = require('./../').Link
const { bootTwoGrapes, killGrapes } = require('./helper')

let rpc1, rpc2, grapes
describe('RPC socket pools / loadbalancing', () => {
  before(function (done) {
    this.timeout(8000)
    bootTwoGrapes((err, g) => {
      if (err) throw err

      grapes = g
      grapes[0].once('announce', (msg) => {
        done()
      })

      const f = path.join(__dirname, 'fixtures', 'mock-rpc-server.js')
      rpc1 = spawn('node', [ f ])
      rpc2 = spawn('node', [ f ])
    })
  })

  after(function (done) {
    this.timeout(5000)
    rpc1.on('close', () => {
      rpc2.on('close', () => {
        killGrapes(grapes, done)
      })
      rpc2.kill()
    })

    rpc1.kill()
  })

  it('maps over multiple servers', (done) => {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()

    const peer = new PeerRPCClient(link, {})
    peer.init()

    const reqs = 10
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

    parallel(tasks, (err, data) => {
      if (err) throw err

      assert.equal(data.length, 10)

      const uuidList = data.reduce((acc, el) => {
        acc.push(el[0], el[1])
        return acc
      }, [])

      const uuids = _.uniq(uuidList)

      assert.equal(uuids.length, 2)

      done()
    })
  }).timeout(15000)
})
