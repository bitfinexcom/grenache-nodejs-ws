'use strict'

const Base = require('grenache-nodejs-base')
const TransportRPCClient = require('./TransportRPCClient')

class PeerRPCClient extends Base.PeerRPCClient {
  getTransportClass () {
    return TransportRPCClient
  }
}

module.exports = PeerRPCClient
