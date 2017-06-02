/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const PeerSub = require('./../').PeerSub
const Link = require('./../').Link
const { bootTwoGrapes, killGrapes } = require('./helper')

let pub, grapes
describe('Pub/Sub integration', () => {
  before(function (done) {
    this.timeout(10000)

    bootTwoGrapes((err, g) => {
      if (err) throw err

      grapes = g
      grapes[0].once('announce', (msg) => {
        done()
      })

      const f = path.join(__dirname, '..', 'examples', 'pub.js')
      pub = spawn('node', [ f ])
    })
  })

  after(function (done) {
    this.timeout(5000)
    pub.on('close', () => {
      killGrapes(grapes, done)
    })
    pub.kill()
  })

  it('messages subscribers', (done) => {
    const link = new Link({
      grape: 'ws://127.0.0.1:30001'
    })
    link.start()

    const peer = new PeerSub(link, {})
    peer.init()

    link.on('connect', () => {
      peer.sub('pub_test', { timeout: 10000 })

      peer.on('message', (msg) => {
        assert.equal(msg, 'world')
        done()
      })
    })
  }).timeout(15000)
})
