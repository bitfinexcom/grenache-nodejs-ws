'use strict'

var _ = require('lodash')
var Base = require('grenache-nodejs-base')
var Peer = require('./../lib/Peer')

var link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

var worker = new Peer(link, {})
var service = worker.listen('req', 5000)

setInterval(function() {
  worker.announce('test', service.port, {}, () => {
    console.log('announced')
  })

  var v = 'hello'

  worker.put({ v: v }, (err, res) => {
    console.log('val: ' + v + ' saved to the DHT', res) 
  })
}, 1000)

worker.on('request', (rid, type, payload, handler) => {
  //console.log('worker', rid, type, payload)
  handler.reply('world')
})
