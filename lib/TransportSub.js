'use strict'

const UWS = require('uws')
const Base = require('grenache-nodejs-base')

class TransportSub extends Base.TransportSub {

  sub() {
    console.log('here')
    const dest = `ws://${this.conf.dest}/ws`

    this.connecting()

    const socket = this.socket = new UWS(dest)

    socket.on('message', data => {
      console.log('here')
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

  _disconnect() {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch(e) {}
    this.socket = null
  }
  
  _stop() {
    super._stop()
    this._disconnect()
  }
}

module.exports = TransportSub
