'use strict'

const Base = require('grenache-nodejs-base')
const Ws = require('ws')
const https = require('https')
const assert = require('assert')

class TransportRPCServer extends Base.TransportRPCServer {
  listen (port) {
    assert(Number.isInteger(port), 'port must be an Integer')

    this.listening()

    const secure = this.conf.secure
    const socket = secure ?
      this.getSecureSocket(port, secure) : this.getSocket({ port: port })

    socket.on('connection', (socket, req) => {
      const cert = secure ? req.connection.getPeerCertificate() : null
      const meta = { cert }

      const handler = {
        reply: (rid, err, res) => {
          this.sendReply(socket, rid, err, res)
        }
      }
      socket.on('message', data => {
        this.handleRequest(
          handler,
          this.parse(data),
          meta
        )
      })
    })

    socket.on('close', () => {
      this.unlistening()
    })

    this.socket = socket
    this.port = port

    return this
  }
  handleRequest (handler, data, meta) {
    if (!data) {
      this.emit('request-error')
      return
    }

    const rid = data[0]
    const key = data[1]
    const payload = data[2]

    this.emit(
      'request', rid, key, payload,
      {
        reply: (err, res) => {
          handler.reply(rid, err, res)
        }
      },
      meta.cert
    )
  }

  getSecureSocket (port, secure) {
    assert(Buffer.isBuffer(secure.key), 'conf.secure.key must be a Buffer')
    assert(Buffer.isBuffer(secure.cert), 'conf.secure.cert must be a Buffer')
    assert(Buffer.isBuffer(secure.ca), 'conf.secure.ca must be a Buffer')
    assert.strictEqual(typeof secure.verifyClient, 'function', 'conf.secure.verify must be a function')

    const opts = Object.assign({}, secure, { requestCert: true })
    const httpsServer = https.createServer(opts, (req, res) => {
      req.socket.write('')
      req.socket.end()
    }).listen(port)

    return new Ws.Server({
      server: httpsServer,
      verifyClient: secure.verifyClient
    })
  }

  getSocket (opts) {
    return new Ws.Server(opts)
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
