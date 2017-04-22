'use strict'

const _ = require('lodash')
const Base = require('grenache-nodejs-base')
const TransportRPC = require('./TransportRPC')

class PeerRPC extends Base.PeerRPC {

  init() {
    super.init()

    this.tpool = new Base.PoolTransport()
    this.tpool.init()
  }

  getTransportClass() {
    return TransportRPC 
  }

  transport(dest) {
    let t = this.tpool.getActive(dest)
    if (t) return t

    t = super.transport(dest)
    this.tpool.add(dest, t)
    return t
  }

  stop() {
    this.tpool.stop()
    super.stop()
  }
}

module.exports = PeerRPC
