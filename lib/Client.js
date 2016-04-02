'use strict'

var uuid = require('uuid')
var WS = require('ws')
var url = require('url')
var _ = require('lodash')
var Base = require('grenache-nodejs-base')

class Client extends Base.Client {
  
  constructor(grape, conf) {
    super(grape, conf)
  }


  _listen(transport, type, port) {
    var dest = 'ws://0.0.0.0:' + port + '/ws'
    var socket = new WS.Server({ port: port });

    if (type === 'req') {
      socket.on('connection', (socket) => {
        socket.on('message', data => {
          data = JSON.parse(data)
          this.emit(
            'request', data[0], data[1], data[2],
            {
              reply: res => {
                socket.send(JSON.stringify([data[0], res]))
              }
            }
          )
        })
      })
    }

    transport.set({
      socket: socket,
      port: port
    })
   
    return transport
  }

  _connect(transport, type, dest, cb) {
    var socket = new WS(dest);
    transport.set({
      socket: socket
    })

    socket.on('message', (data) => {
      data = JSON.parse(data)
      this.handleReply(data[0], data[1])
    })

    socket.on('open', () => {
      transport.emit('connect')
    })
  }

  _send(transport, data) {
    transport.socket.send(JSON.stringify(data))
  }

  stop() {
    _.each(this._transports, socket => {
      socket.close()
    })

    super.stop()
  }
}

module.exports = Client
