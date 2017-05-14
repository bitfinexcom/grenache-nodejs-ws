'use strict'

const UWS = require('uws')
const Base = require('grenache-nodejs-base')

class TransportRPCClient extends Base.TransportRPCClient {

  init() {
    super.init()

    this.kueue = new Base.Kueue()
  }
    
  request(key, payload, opts, cb) {
    this.setLastRequestTime()

    this.kueue.push('req', (err) => {
      if (err) return cb(err)
      this._request(key, payload, opts, cb)
    })
    
    this.connect()
  }

  connect() {
    const dest = `ws://${this.conf.dest}/ws`

    if (this.isConnected()) {
      return this.kueue.trigger('req')
    }

    if (this.isConnecting()) return

    this._disconnect()
    this.connecting()

    const socket = this.socket = new UWS(dest)

    socket.on('message', (data) => {
      data = this.parse(data)
      if (!data) return

      const rid = data[0]
      const res = data[1]

      this.handleReply(rid, res)
    })

    socket.on('open', () => {
      this.connected()
      this.kueue.trigger('req')
    })

    socket.on('close', () => {
      this.disconnected()
      this.kueue.trigger('req', 'ERR_TRANSPORT_CLOSE')
    })
  }

  disconnect() {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch(e) {}
    this.disconnected()
    this.socket = null
  }

  sendRequest(req) {
    this.socket.send(
      this.format([req.rid, req.key, req.payload])
    )
  }

  _stop() {
    super._stop()
    this.disconnect()
  }
}

module.exports = TransportRPCClient
