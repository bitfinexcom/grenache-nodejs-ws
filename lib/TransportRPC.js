'use strict'

const UWS = require('uws')
const Base = require('grenache-nodejs-base')

class TransportRPC extends Base.TransportRPC {

  init() {
    super.init()

    this.kueue = new Base.Kueue()
    this.setLastRequestTime()
  }

  listen(port) {
    this.listening()

    const socket = new UWS.Server({ port: port })

    socket.on('connection', (socket) => {
      socket.on('message', data => {
        this.handleRequest({
          reply: (rid, res) => {
            this.sendReply(socket, rid, res)
          }
        }, this.parse(data))
      })
    })

    socket.on('close', () => {
      this.unlistening()
    })

    this.socket = socket
    this.port = port

    return this
  }

  setLastRequestTime() {
    this._req_last_ts = Date.now()
  }

  request(key, payload, opts, cb) {
    this.setLastRequestTime()

    this.kueue.push('req', (err) => {
      if (err) return cb(err)
      this._request(key, payload, opts, cb)
    })
    
    this._connect()
  }

  _request(key, payload, opts, cb) {
    const req = this.newRequest(key, payload, opts, cb)
    this.addRequest(req)
    this.sendRequest(req)
  }

  _connect() {
    const dest = `ws://${this.conf.dest}/ws`

    if (this.isConnected()) {
      return this.kueue.trigger('req')
    }

    if (this.isConnecting()) {
      return
    }

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

  _disconnect() {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch(e) {}
    this.socket = null
  }
  
  sendReply(socket, rid, res) {
    socket.send(this.format([rid, res]))
  }

  sendRequest(req) {
    this.socket.send(this.format([req.rid, req.key, req.payload]))
  }

  monitor() {
    super.monitor()

    if (!this.isListening()) {
      const diff_lr = Date.now() - this._req_last_ts
      if (!this._reqs.size && diff_lr > 10000) {
        this.stop()
      }
    }
  }

  _stop() {
    super._stop()
    this._disconnect()
  }
}

module.exports = TransportRPC
