'use strict'

const Base = require('grenache-nodejs-base')
const TransportPub = require('./TransportPub')

class PeerPub extends Base.PeerPub {
  getTransportClass () {
    return TransportPub
  }
}

module.exports = PeerPub
