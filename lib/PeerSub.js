'use strict'

const Base = require('grenache-nodejs-base')
const TransportSub = require('./TransportSub')

class PeerSub extends Base.PeerSub {
  getTransportClass () {
    return TransportSub
  }
}

module.exports = PeerSub
