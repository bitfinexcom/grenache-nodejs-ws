'use strict'

const Base = require('grenache-nodejs-base')
const UWS = require('uws')
const CbQ = require('cbq')

class TransportRPCClient extends Base.TransportRPCClient {
  init () {
    super.init()

    this.cbq = new CbQ()
  }

  request (key, payload, opts, cb) {
    this.setLastRequestTime()

    this.cbq.push('req', (err) => {
      if (err) return cb(err)
      this._request(key, payload, opts, cb)
    })

    this.connect()
  }

  connect () {
    const dest = `ws://${this.conf.dest}/ws`

    if (this.isConnected()) {
      return this.cbq.trigger('req')
    }

    if (this.isConnecting()) return

    this.disconnect()
    this.connecting()

    const socket = this.socket = this.getSocket(dest)

    socket.on('message', (data) => {
      data = this.parse(data)
      if (!data) return

      const [rid, _err, res] = data
      this.handleReply(rid, _err ? new Error(_err) : null, res)
    })

    socket.on('open', () => {
      this.connected()
      this.cbq.trigger('req')
    })

    socket.on('close', () => {
      this.disconnected()
      this.cbq.trigger('req', new Error('ERR_TRANSPORT_CLOSE'))
    })
  }

  getSocket (opts) {
    return new UWS(opts)
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
