'use strict'

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')

exports.bootTwoGrapes = bootTwoGrapes
function bootTwoGrapes (cb) {
  const grape1 = new Grape({
    dht_port: 20002,
    dht_bootstrap: [ '127.0.0.1:20001' ],
    api_port_http: 40001
  })
  const grape2 = new Grape({
    dht_port: 20001,
    dht_bootstrap: [ '127.0.0.1:20002' ],
    api_port_http: 30001
  })

  waterfall([
    (cb) => {
      grape1.start((err) => {
        if (err) throw err
      })
      grape1.once('ready', cb)
    },
    (cb) => {
      grape2.start((err) => {
        if (err) throw err
      })
      grape2.once('node', cb)
    }
  ], () => {
    cb(null, [ grape1, grape2 ])
  })
}

exports.killGrapes = killGrapes
function killGrapes (grapes, done) {
  grapes[0].stop((err) => {
    if (err) throw err
    grapes[1].stop((err) => {
      if (err) throw err
      done()
    })
  })
}
