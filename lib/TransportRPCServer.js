'use strict'

const Base = require('grenache-nodejs-base')
const UWS = require('uws')
const assert = require('assert')

class TransportRPCServer extends Base.TransportRPCServer {
  listen (port) {
    assert(Number.isInteger(port), 'port must be an Integer')

    this.listening()

    const socket = this.getSocket({ port: port })

    socket.on('connection', (socket) => {
      socket.on('message', data => {
        this.handleRequest({
          reply: (rid, err, res) => {
            this.sendReply(socket, rid, err, res)
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

  getSocket (opts) {
    return new UWS.Server(opts)
  }

  unlisten () {
    if (!this.socket) return
    try {
      this.socket.close()
    } catch (e) {}
    this.socket = null
  }

  sendReply (socket, rid, err, res) {
    socket.send(this.format([rid, err ? err.message : null, res]))
  }

  _stop () {
    super._stop()
    this.unlisten()
  }
}

module.exports = TransportRPCServer
