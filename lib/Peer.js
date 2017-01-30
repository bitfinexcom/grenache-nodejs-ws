'use strict'

const uuid = require('uuid')
const UWS = require('uws')
const _ = require('lodash')
const Base = require('grenache-nodejs-base')

class Peer extends Base.Peer {
  
  constructor(grape, conf) {
    super(grape, conf)
  }

  parse(data) {
    try {
      data = JSON.parse(data)
    } catch(e) {
      data = null
    }

    return data
  }

  format(data) {
    return JSON.stringify(data)
  }

  transport(data) {
    const transport = super.transport(data)

    transport.set({
      persist: true
    })

    return transport
  }

  _listen(transport, type, port) {
    const socket = new UWS.Server({ port: port });
      
    socket.on('connection', (socket) => {
      if (type === 'req') {
        socket.on('message', data => {
          this.handleRequest({
            reply: (rid, res) => {
              socket.send(this.format([rid, res]))
            }
          }, this.parse(data))
        })
      }
    })

    transport.set({
      socket: socket,
      port: port
    })
   
    return transport
  }

  _connect(transport, type, _dest) {
    const dest = 'ws://' + _dest + '/ws'
    const socket = new UWS(dest)

    transport.set({
      socket: socket
    })

    socket.on('message', (data) => {
      data = this.parse(data)
      if (!data) return

      const rid = data[0]
      const res = data[1]

      this.handleReply(rid, res)
    })

    socket.on('open', () => {
      transport.emit('connect')
    })
  }

  _send(transport, data) {
    transport.socket.send(this.format(data))
  }

  stop() {
    _.each(this._transports, socket => {
      socket.close()
    })

    super.stop()
  }
}

module.exports = Peer
