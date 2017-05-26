'use strict'

const UWS = require('uws')
const Base = require('grenache-nodejs-base')
const Ws = require('ws')
const assert = require('assert')

class TransportRPCClient extends Base.TransportRPCClient {
  init () {
    super.init()

    this.dest = this.getDest(this.conf.secure)
    this.kueue = new Base.Kueue()
  }

  request (key, payload, opts, cb) {
    this.setLastRequestTime()

    this.kueue.push('req', (err) => {
      if (err) return cb(err)
      this._request(key, payload, opts, cb)
    })

    this.connect()
  }

  connect () {
    if (this.isConnected()) {
      return this.kueue.trigger('req')
    }

    if (this.isConnecting()) return

    this.disconnect()
    this.connecting()

    const socket = this.socket = this.getSocket(this.dest, this.conf)

    socket.on('message', (data) => {
      data = this.parse(data)
      if (!data) return

      const [rid, _err, res] = data
      this.handleReply(rid, _err ? new Error(_err) : null, res)
    })

    socket.on('open', () => {
      this.connected()
      this.kueue.trigger('req')
    })

    socket.on('close', () => {
      this.disconnected()
      this.kueue.trigger('req', new Error('ERR_TRANSPORT_CLOSE'))
    })
  }

  getDest (secure) {
    if (secure) {
      return `wss://${this.conf.dest}/ws`
    }

    return `ws://${this.conf.dest}/ws`
  }

  getSocket (dest, conf) {
    const secure = conf.secure

    // https://github.com/uWebSockets/bindings/issues/23
    if (!secure) {
      const socket = this.socket = new UWS(dest)
      return socket
    }

    assert(Buffer.isBuffer(secure.key), 'conf.secure.key must be a Buffer')
    assert(Buffer.isBuffer(secure.cert), 'conf.secure.cert must be a Buffer')
    assert(Buffer.isBuffer(secure.ca), 'conf.secure.ca must be a Buffer')

    const socket = this.socket = new Ws(dest, secure)
    return socket
  }

  disconnect () {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch (e) {}
    this.disconnected()
    this.socket = null
  }

  sendRequest (req) {
    this.socket.send(
      this.format([req.rid, req.key, req.payload])
    )
  }

  _stop () {
    super._stop()
    this.disconnect()
  }
}

module.exports = TransportRPCClient
