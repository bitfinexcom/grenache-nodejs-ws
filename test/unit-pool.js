/* eslint-env mocha */

'use strict'

const assert = require('assert')

const PeerRPCClient = require('./../').PeerRPCClient
const Link = require('./../').Link

describe('unit RPC socket pools / loadbalancing', () => {
  it('has a pool of connections to the same dest', () => {
    const link = new Link({
      grape: 'ws://127.0.0.1:30001'
    })
    link.start()

    const peer = new PeerRPCClient(link, {})
    peer.init()

    // maximum is 3 per dest as default value
    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')

    const oneDest = peer.tpool.list('127.0.0.1:1337')
    assert.equal(oneDest.length, 3)
  })

  it('has a configurable pool of connections to the same dest', () => {
    const link = new Link({
      grape: 'ws://127.0.0.1:30001'
    })
    link.start()

    const peer = new PeerRPCClient(link, { maxActiveDestTransports: 2 })
    peer.init()

    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')
    peer.transport('127.0.0.1:1337')

    const oneDest = peer.tpool.list('127.0.0.1:1337')
    assert.equal(oneDest.length, 2)
  })
})
