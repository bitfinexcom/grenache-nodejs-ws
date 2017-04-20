'use strict'

const fs = require('fs')
const _ = require('lodash')
const Base = require('grenache-nodejs-base')
const Peer = require('./../lib/Peer')

const link = new Base.Link({
  grape: 'ws://127.0.0.1:30002'
})
link.start()

const client = new Peer(link, {})

const reqs = 10000
let reps = 0


const elapsed_time = function(start, note) {
  const precision = 3; // 3 decimal places
  const elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
  console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
  start = process.hrtime(); // reset the timer
}

setTimeout(() => {
  let start = process.hrtime()
  for (let i = 0; i < reqs; i++) {
    client.request('test', 'here', { timeout: 10000 }, (err, data) => {
      console.log(err, data)
      if (++reps === reqs) {
        elapsed_time(start, 'finished')
      }
    })
  }
}, 2000)

setInterval(() => {
  client.request('test', 'here', { timeout: 10000 }, (err, data) => {
    console.log(err, data)
  })
}, 2000)
