/* eslint-env mocha */

'use strict'

const assert = require('assert')
const spawn = require('child_process').spawn
const path = require('path')

const PeerSub = require('./../').PeerSub
const Link = require('./../').Link
const { bootTwoGrapes } = require('./helper')

let pub, grapes
describe('Pub/Sub integration', () => {
  before(function (done) {
    this.timeout(8000)

    grapes = bootTwoGrapes()
    grapes[0].once('announce', (msg) => {
      done()
    })
    grapes[1].on('ready', () => {
      const f = path.join(__dirname, '..', 'examples', 'pub.js')
      pub = spawn('node', [ f ])
    })
  })

  after(function (done) {
    this.timeout(5000)
    pub.on('close', () => {
      done()
    })
    grapes[0].stop(() => {})
    grapes[1].stop(() => {})
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
