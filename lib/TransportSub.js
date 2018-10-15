'use strict'

const Ws = require('ws')
const Base = require('grenache-nodejs-base')

class TransportSub extends Base.TransportSub {
  init () {
    super.init()

    this._checkConnectionItv = setInterval(this.checkConnection.bind(this), 5000)
  }

  sub () {
    const dest = `ws://${this.conf.dest}/ws`

    this.connecting()

    const socket = this.socket = new Ws(dest)

    socket.on('message', data => {
      this.emit('message', data)
    })

    socket.on('open', () => {
      this.connected()
      this.emit('connected')
    })

    socket.on('close', () => {
      this.disconnected()
      this.emit('disconnected')
    })
  }

  unsub () {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch (e) {}
    this.socket = null
    this.disconnected()
  }

  checkConnection () {
    if (!this.isActive() || this.isConnected()) return
    this.unsub()
  }

  _stop () {
    super._stop()
    clearInterval(this._checkConnectionItv)
    this.unsub()
  }
}

module.exports = TransportSub
