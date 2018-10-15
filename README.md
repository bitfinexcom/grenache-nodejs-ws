# [Grenache](https://github.com/bitfinexcom/grenache) Node.JS WebSocket implementation

<img src="logo.png" width="15%" />

Grenache is a micro-framework for connecting microservices. Its simple and optimized for performance.

Internally, Grenache uses Distributed Hash Tables (DHT, known from Bittorrent) for Peer to Peer connections. You can find more details how Grenche internally works at the [Main Project Homepage](https://github.com/bitfinexcom/grenache)

 - [SSL](#ssl-support)
 - [Setup](#setup)
 - [Examples](#examples)
 - [API](#api)


 ## SSL Support

 ```
 PeerRPCClient
 PeerRPCServer
 ```

## Setup

### Install
```
npm install --save grenache-nodejs-ws
```

### Other Requirements

Install `Grenache Grape`: https://github.com/bitfinexcom/grenache-grape:

```bash
npm i -g grenache-grape
```

```
// Start 2 Grapes
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

### Examples

#### RPC Server / Client

This RPC Server example announces a service called `rpc_test`
on the overlay network. When the client makes a request, the client
connects to the DHT, the Grapes. They return a list of IPs which announce
the service `rpc_test`. The client then open a direct P2P connection to the
service.

The client sends `hello` and receives `world` from the server.

Internally the DHT is asked for the IP of the server and then the
request is done as Peer-to-Peer request via websockets.

**Grape:**

```bash
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```

**Server:**

```js
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  console.log(payload) // hello
  handler.reply(null, 'world')
})
```

**Client:**

```js
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

peer.request('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data) // world
})

```

[Code Server](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_server.js)
[Code Client](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_client.js)


#### SSL Example

This RPC Server example announces a service called
`rpc_whitelist_service` on the overlay network. When a client tries to
connect, we check on the serverside if the certificate fingerprint
matches the list of clients that we have whitelisted for connections,
using [the verifyClient callback](https://github.com/websockets/ws/blob/62cd03ea3705123136c20eedac1b57559d8ea542/doc/ws.md#new-websocketserveroptions-callback).

In case of a matching fingerprint, we establish the Websocket
connection.

The certificate data is also passed to the request handlers of the
server. That allows us to further define permissions for each client.

The fingerprint allows us to verify that just certain clients are
allowed to run a specific action. In the example the client is allowed
to run the `ping` command, but is not allowed to execute the action
`deleteHarddisk`.

Behind the scenes the DHT is asked for the IP of the server and then
the request is done as Peer-to-Peer request via Websockets.

**Server:**

```js
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

// this function is testing the cert before the ws connection
// with the client is established.
const VALID_FINGERPRINTS = [
  '22:48:11:0C:56:E7:49:2B:E9:20:2D:CE:D6:B0:7D:64:F2:32:C8:4B'
]

function verifyClient (info, cb) {
  const cert = info.req.socket.getPeerCertificate()

  if (VALID_FINGERPRINTS.indexOf(cert.fingerprint) !== -1) {
    return cb(true)
  }

  return cb(false, 401, 'Forbidden')
}

// bootstrap our server
const opts = {
  secure: {
    key: fs.readFileSync(path.join(__dirname, 'certs', 'server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs', 'server-crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca-crt.pem')),
    requestCert: true,
    rejectUnauthorized: false, // take care, can be dangerous in production!
    verifyClient: verifyClient
  }
}
const peer = new PeerRPCServer(
  link,
  opts
)
peer.init()

const service = peer.transport('server')
service.listen(1337)

setInterval(function () {
  link.announce('rpc_whitelist_service', service.port, {})
}, 1000)

// this function is used to whitelist certain actions based on
// the fingerprint after the tls ws connection has established
// nobody is allowed to delete the harddisk, but one client is
// allowed to perform the ping action
const permissions = {
  deleteHarddisk: [],
  ping: [
    '22:48:11:0C:56:E7:49:2B:E9:20:2D:CE:D6:B0:7D:64:F2:32:C8:4B'
  ]
}

function isAllowedToPerformAction (action, fingerprint) {
  if (!permissions[action]) {
    return false
  }

  if (permissions[action].indexOf(fingerprint) !== -1) {
    return true
  }

  return false
}

// request handler which checks if the client is allowed to perform the
// current action. uses a whitelist and certificate fingerprints
service.on('request', (rid, key, payload, handler, cert) => {
  if (isAllowedToPerformAction(payload.action, cert.fingerprint)) {
    handler.reply(null, payload.action + ' action is allowed for this client')
    return
  }

  handler.reply(new Error('forbidden'))
})
```

**Client:**

```js
const Link = require('grenache-nodejs-link')
const link = new Link({
  grape: 'http://127.0.0.1:30001'
})

link.start()

const secure = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'client1-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'client1-crt.pem')),
  ca: fs.readFileSync(path.join(__dirname, 'certs', 'ca-crt.pem')),
  rejectUnauthorized: false // take care, can be dangerous in production!
}

const peer = new PeerRPCClient(
  link,
  { secure: secure }
)

peer.init()

link.on('connect', () => {
  peer.request('rpc_whitelist_service', { action: 'ping' }, { timeout: 10000 }, (err, data) => {
    console.log(err, data) // logs: null 'ping action is allowed for this client'
  })

  // errors with forbidden error
  peer.request('rpc_whitelist_service', { action: 'deleteHarddisk' }, { timeout: 10000 }, (err, data) => {
    console.log(err, data) // logs: Error: forbidden
  })
})
```

[Server Code](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/ssl/rpc_cert_whitelist_server.js)
<br/>
[Client Code](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/ssl/rpc_cert_whitelist_client.js)


## API

### Class: PeerRPCServer

#### Event: 'request'

Emitted when a request from a RPC client is received.

  - `rid` unique request id
  - `key` name of the service
  - `payload` Payload sent by client
  - `handler` Handler object, used to reply to a client.

```js
service.on('request', (rid, key, payload, handler) => {
  handler.reply(null, 'world')
})
```

#### new PeerRPCServer(link, [options])

 - `link <Object>` Instance of a [Link Class](#new-linkoptions)
 - `options <Object>`
   - `secure <Object>` TLS options
     - `key <Buffer>` Key file content
     - `cert <Buffer>` Cert file content
     - `ca <Buffer>` Ca file content
     - `rejectUnauthorized <Boolean>` Reject IPs / Hostnames not in cert's list
     - `requestCert <Boolean>` Request a certificate from a connecting client
     - `verifyClient <Function>` Function to verify connecting client before Websocket connection is established.

Creates a new instance of a `PeerRPCServer`, which connects to the DHT
using the passed `link`.

#### peer.init()

Sets the peer active. Must get called before we get a transport
to set up a server.

#### peer.transport('server')

Must get called after the peer is active. Sets peer into server-
mode.

#### peer.listen(port)

Lets the `PeerRPCServer` listen on the desired `port`. The port is
stored in the DHT.

#### peer.port

Port of the server (set by `listen(port)`).

#### Example

This RPC Server example announces a service called `rpc_test`
on the overlay network. When a request from a client is received,
it replies with `world`. It receives the payload `hello` from the
client.

The client sends `hello` and receives `world` from the server.

Internally the DHT is asked for the IP of the server and then the
request is done as Peer-to-Peer request via websockets.

**Server:**

```js
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {})
peer.init()

const service = peer.transport('server')
service.listen(_.random(1000) + 1024)

setInterval(function () {
  link.announce('rpc_test', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  console.log(payload) // hello
  handler.reply(null, 'world')
})
```

**Client:**

```js
const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

peer.request('rpc_test', 'hello', { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data) // world
})

```

[Server](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_server.js)
[Client](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_client.js)


### Class: PeerRPCClient

#### new PeerRPCClient(link, [options])

 - `link <Object>` Instance of a [Link Class](#new-linkoptions)
 - `options <Object>`
    - `maxActiveKeyDests <Number>`
    - `maxActiveDestTransports <Number>`

Creates a new instance of a `PeerRPCClient`, which connects to the DHT
using the passed `link`.

A PeerRPCClient can communicate with multiple Servers and map work items over them.
With `maxActiveKeyDests` you can limit the maximum amount of destinations.
Additionally, you can limit the amount of transports with `maxActiveDestTransports`.

#### peer.init()

Sets the peer active. Must get called before we start to make requests.

#### peer.map(name, payload, [options], callback)
  - `name <String>` Name of the service to address
  - `payload <String>` Payload to send
  - `options <Object>` Options for the request
    - `timeout <Number>` timeout in ms
    - `limit <Number>` maximum requests per available worker
  - `callback <Function>`

Maps a number of requests over the amount of registered workers / PeerRPCServers.
[Example](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_client_map.js).


#### peer.request(name, payload, [options], callback)
  - `name <String>` Name of the service to address
  - `payload <String>` Payload to send
  - `options <Object>` Options for the request
    - `timeout <Number>` timeout in ms
    - `retry <Number>` attempts to make before giving up. default is 1
  - `callback <Function>`

Sends a single request to a RPC server/worker.
[Example](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/rpc_client.js).

### Class: PeerPub

#### new PeerPub(link, [options])

 - `link <Object>` Instance of a [Link Class](#new-linkoptions)
 - `options <Object>`

#### peer.init()

Sets the peer active. Must get called before we get a transport
to set up a server.

#### peer.transport('server')

Must get called after the peer is active. Sets peer into server-
mode.

#### peer.listen(port)

Lets the `PeerRPCServer` listen on the desired `port`. The port is
stored in the DHT.

#### peer.pub(payload)

  - `payload <String>` Payload to send

Sends a message to all connected peers.
[Example](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/pub.js).

### Class: PeerSub

#### new PeerSub(link, [options])

 - `link <Object>` Instance of a [Link Class](#new-linkoptions)
 - `options <Object>`

Creates a new instance of a `PeerSub`, which connects to the DHT
using the passed `link`.

#### .sub(name, [options])
  - `name <String>` Name of the Pub Channel to register
  - `options <Object>` Options for the request
    - `timeout <Number>` timeout in ms

Registers as a receiver for messages.
[Example](https://github.com/bitfinexcom/grenache-nodejs-ws/tree/master/examples/sub.js).

#### Event: 'message'

Emitted when a payload is received.
