'use strict'

const uuid = require('uuid')
const Ws = require('ws')
const Base = require('grenache-nodejs-base')
const assert = require('assert')

class TransportPub extends Base.TransportPub {
  init () {
    super.init()

    this._sockets = new Map()
  }

  listen (port) {
    assert(Number.isInteger(port), 'port must be an Integer')

    this.listening()

    const socket = new Ws.Server({ port: port })

    socket.on('connection', socket => {
      const sid = socket._grc_id = uuid.v4()

      this._sockets.set(sid, socket)

      socket.on('close', () => {
        this._sockets.delete(sid)
      })
    })

    socket.on('close', () => {
      this.unlistening()
    })

    this.socket = socket
    this.port = port

    return this
  }

  pub (msg) {
    this._sockets.forEach(socket => {
      socket.send(msg)
    })
  }
}

module.exports = TransportPub
