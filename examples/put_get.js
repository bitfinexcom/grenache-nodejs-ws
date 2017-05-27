// make sure you start grenache-grape:
// grape --dp 20001 --apw 30001 --aph 40001 --bn "127.0.0.1:20002,127.0.0.1:20003"

'use strict'

const Grenache = require('./../')
const Link = Grenache.Link

const link = new Link({
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
