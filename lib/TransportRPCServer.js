'use strict'

const UWS = require('uws')
const Base = require('grenache-nodejs-base')

class TransportRPCServer extends Base.TransportRPCServer {
 
  listen (port) {
    this.listening()

    const socket = new UWS.Server({ port: port })

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
