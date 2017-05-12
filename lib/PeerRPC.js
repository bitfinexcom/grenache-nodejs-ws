'use strict'

const _ = require('lodash')
const Base = require('grenache-nodejs-base')
const TransportRPC = require('./TransportRPC')

class PeerRPC extends Base.PeerRPC {

  getTransportClass() {
    return TransportRPC 
  }
}

module.exports = PeerRPC
