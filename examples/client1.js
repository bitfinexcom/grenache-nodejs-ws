'use strict'

var _ = require('lodash')
var Base = require('grenache-nodejs-base')
var Client = require('./../lib/Client')

var link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

var client = new Client(link, {})
var service = client.listen('req', 5000)

setInterval(function() {
  client.announce('test', service.port, {}, () => {
    console.log('announced')
  })
}, 1000)

client.on('request', (rid, type, payload, handler) => {
  //console.log('client1', rid, type, payload)
  handler.reply('world')
})
