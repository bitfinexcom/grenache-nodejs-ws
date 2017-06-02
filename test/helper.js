'use strict'

const { Grape } = require('grenache-grape')
const waterfall = require('async/waterfall')

exports.bootTwoGrapes = bootTwoGrapes
function bootTwoGrapes (cb) {
  const grape1 = new Grape({
    dht_port: 20002,
    dht_bootstrap: [ '127.0.0.1:20001', '127.0.0.1:20003' ],
    api_port: 40001,
    api_port_http: 40002
  })
  const grape2 = new Grape({
    dht_port: 20001,
    dht_bootstrap: [ '127.0.0.1:20002', '127.0.0.1:20003' ],
    api_port: 30001,
    api_port_http: 30002
  })

  waterfall([
    (cb) => {
      grape1.start()
      grape1.once('ready', cb)
    },
    (cb) => {
      grape2.start()
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
