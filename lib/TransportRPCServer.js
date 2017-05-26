'use strict'

const UWS = require('uws')
const https = require('https')

const Base = require('grenache-nodejs-base')
const assert = require('assert')

class TransportRPCServer extends Base.TransportRPCServer {
  listen (port) {
    this.listening()

    const socket = this.getSocket(port, this.conf)

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

  getSocket (port, conf) {
    const secure = conf.secure

    if (!secure) {
      return new UWS.Server({ port: port })
    }

    assert(Buffer.isBuffer(secure.key), 'conf.secure.key must be a Buffer')
    assert(Buffer.isBuffer(secure.cert), 'conf.secure.cert must be a Buffer')
    assert(Buffer.isBuffer(secure.ca), 'conf.secure.ca must be a Buffer')
    assert.equal(typeof secure.verifyClient, 'function', 'conf.secure.verify must be a function')

    const opts = Object.assign({}, secure, { requestCert: true })
    const httpsServer = https.createServer(opts, (req, res) => {
      req.socket.write('')
      req.socket.end()
    }).listen(port)

    return new UWS.Server({
      server: httpsServer,
      verifyClient: secure.verifyClient
    })
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
