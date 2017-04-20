'use strict'

const _ = require('lodash')
const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/Peer')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const worker = new Peer(link, {})
const service = worker.listen('req', 5000)

setInterval(function() {
  worker.announce('test', service.port, {}, () => {
    console.log('announced')
  })

  const v = 'hello'

  worker.put({ v: v }, (err, res) => {
    console.log('val: ' + v + ' saved to the DHT', res) 
  })
}, 1000)

worker.on('request', (rid, key, payload, handler) => {
  //console.log('worker', rid, key, payload)
  handler.reply('world')
})
