'use strict'

const _ = require('lodash')
const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/PeerRPC')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

const worker = new Peer(link, {})
const service = worker.transport('server')
service.listen(50000)

setInterval(function() {
  worker.announce('test', service.port, {}, () => {
    console.log('announced', service.port)
  })

  const v = 'hello'

  worker.put({ v: v }, (err, res) => {
    console.log('val: ' + v + ' saved to the DHT', res) 
  })
}, 1000)

service.on('request', (rid, key, payload, handler) => {
//  handler.reply('world')
})
