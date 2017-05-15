'use strict'

const Base = require('grenache-nodejs-base')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30001'
})
link.start()

setInterval(() => {
  link.put({ v: 'hello world' }, (err, hash) => {
    console.log('data saved to the DHT', err, hash)
    if (hash) {
      link.get(hash, (err, res) => {
        console.log('data requested to the DHT', err, res)
      })
    }
  })
}, 2000)
