'use strict'

var _ = require('lodash')
var Base = require('grenache-nodejs-base')
var Client = require('./../lib/Client')

var link = new Base.Link({
  grape: 'ws://127.0.0.1:30002'
})
link.start()

var client = new Client(link, {})

var reqs = 1000
var reps = 0

setTimeout(() => {
  var d1 = new Date()
  for (var i = 0; i < reqs; i++) {
    client.request('test', 'hello', {}, (err, data) => {
      //console.log("here", err, data)
      if (++reps === reqs) {
        var d2 = new Date()
        console.log(d2 - d1) 
      }
    })
  }
}, 2000)
