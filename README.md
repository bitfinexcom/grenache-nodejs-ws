# Grenache Node.JS WebSocket implementation

### Setup

Install https://github.com/bitfinexcom/grenache-grape

```
// Start 2 Grapes
grape --dp 20001 --ap 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --ap 30002 --bn '127.0.0.1:20001'
```

### Run

```
node examples/worker.js
node examples/client.js
```
