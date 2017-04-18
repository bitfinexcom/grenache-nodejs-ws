'use strict'

var fs = require('fs')
var _ = require('lodash')
var Base = require('grenache-nodejs-base')
var Peer = require('./../lib/Peer')

var link = new Base.Link({
  grape: 'ws://127.0.0.1:30002'
})
link.start()

var client = new Peer(link, {})

var reqs = 100
var reps = 0


const elapsed_time = function(start, note) {
  var precision = 3; // 3 decimal places
  var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
  console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
  start = process.hrtime(); // reset the timer
}

var big = fs.readFileSync('/home/dev/data/arvicco.txt')

setTimeout(() => {
  let start = process.hrtime()
  for (var i = 0; i < reqs; i++) {
    client.request('test', JSON.stringify(big), { timeout: 10000 }, (err, data) => {
      //console.log(err, data)
      if (++reps === reqs) {
        var d2 = new Date()
        elapsed_time(start, 'finished')
      }
    })
  }
}, 2000)
