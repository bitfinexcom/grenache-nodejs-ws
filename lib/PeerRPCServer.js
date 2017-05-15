'use strict'

const Base = require('grenache-nodejs-base')
const TransportRPCServer = require('./TransportRPCServer')

class PeerRPCServer extends Base.PeerRPCServer {
  getTransportClass () {
    return TransportRPCServer
  }
}

module.exports = PeerRPCServer
