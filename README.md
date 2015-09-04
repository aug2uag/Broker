# Broker
aug2uag © 2015

> MQTT (Message Queuing Telemetry Transport) is a publish/subscribe messaging protocol for constrained Internet of Things devices and low-bandwidth, high-latency or unreliable networks.

> Because MQTT specializes in low-bandwidth, high-latency environments, it is an ideal protocol for machine-to-machine (M2M) communication.

## Broker for IoT
1. Validated communications for inter-device management (MQTT)
  * Redundant device validation
2. Point of access to and from other services (HTTP)

## To run app
* configure json as below, and save as `config.json`

```javascript
{
    "mongoose": {
        "url": "mongodb://host.com:$PORT/$DB_NAME",
        "options": {
            "db": {
                "native_parser": true
            },
            "server": {
                "socketOptions": {
                    "connectTimeoutMS": 1000,
                    "keepAlive": 1
                }
            },
            "replset": {
                "socketOptions": {
                    "keepAlive": 1,
                    "connectTimeoutMS": 1000
                }
            },
            "user": "$USER",
            "pass": "$PASS"
        }
    }
}

```

* assign json to environment `$ export CONFIGJSON="../config.json"`

* install deps and run cluster file

```
$ npm install
$ node index.js
```
