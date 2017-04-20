'use strict'

const Base = require('grenache-nodejs-base')

class Transport extends Base.Transport {

  constructor(client, conf) {
    super(client, conf)
  
    this.set({ persist: true })
  }
    
  connected() {
    return super.connected()
  }

  close() {
    this.socket.close()
  }
}

module.exports = Transport
