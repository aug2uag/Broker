#!/usr/bin/env node
/*
broker © 2015
*/

var server_port = 8080
  , http     = require('http')
  , mosca    = require('mosca')
  , express  = require('express')
  , app      = express()
  , bParse   = require('body-parser')
  , broker   = new mosca.Server({
                 port: 1883
               })
  , Device   = require('./model/device').Device;
var httpServ = http.createServer(app);

app.use(bParse.json())

app.get('/', function(req, res) {
    res.json({v: 'MQTT:HTTP v0.0.1'})
});


app.post('/updates', function(req, res) {
    var document = req.body;
    Device.findByDeviceID(document.id, function(err, doc) {
        if (doc) {
            if (document.token !== doc.secret) return res.send(403);
            for (var key in document.options) {
                doc[key] = document.options[key];
            }
            doc.save();
        }
    });
    res.json({status: 'frequency update success 200'})
});

var authenticate = function (client, deviceID, password, callback) {
    console.log('authenticate', deviceID)
    Device.findByDeviceID(deviceID, function(err, doc) {
        console.log(err, doc)
        if (err || !doc) {
            callback(null, false);
        } else {
            doc.client = client;
            doc.lastConnected = new Date;
            doc.save();
            client.deviceID = deviceID;
            callback(null, true);
        };
    });
};

var authorizePublish = function (client, topic, payload, callback) {
    console.log('authorizePublish', topic)
    Device.topicAuthorized(client.deviceID, topic, function(err, truthy) {
        console.log(err, truthy)
        if (err) truthy=false;
        callback(null, truthy);
    });
}

var authorizeSubscribe = function (client, topic, callback) {
    console.log('authorizeSubscribe', topic)
    Device.topicAuthorized(client.deviceID, topic, function(err, truthy) {
        console.log(err, truthy)
        if (err) truthy=false;
        callback(null, truthy);
    });
}

function setup() {
    broker.authenticate = authenticate;
    broker.authorizePublish = authorizePublish;
    broker.authorizeSubscribe = authorizeSubscribe;
    console.log('Mosca broker is up and running.');
};

broker.on('ready', setup);

broker.on("error", function (err) {
    console.log(err);
});

broker.on('clientConnected', function (client) {
    console.log('Client Connected \t:= ', client.id);
    var obj = {
        msg: 'client connected',
        date: new Date
    }
});

broker.on('published', function (packet, client) {
    if (!(packet.topic.match(/\$SYS/))) {
        console.log('published', packet.topic)
        Device.findByDeviceID(client.deviceID, function(err, doc) {
            if (doc) {
                packet.body = packet.payload.toString('utf-8');
                packet.date = new Date;
                delete packet.payload;
                doc.lastPublished = doc.lastPublished || [];
                doc.lastPublished.push(packet);
                doc.save();
            };
        });
    };
});

broker.on('subscribed', function (topic, client) {
    var obj = {
        msg: 'client subscribed',
        topic: topic,
        date: new Date
    }
    Device.findByDeviceID(client.deviceID, function(err, doc) {
        if (doc) {
            doc.lastSubscribed = new Date;
            doc.save();
        };
    });
});

broker.on('clientDisconnecting', function (client) {
    var obj = {
        msg: 'client disconnecting',
        date: new Date
    }
    Device.findByDeviceID(client.deviceID, function(err, doc) {
        if (doc) {
            doc.lastDisconnecting = new Date;
            doc.save();
        };
    });
});

broker.on('clientDisconnected', function (client) {
    var obj = {
        msg: 'client disconnected',
        date: new Date
    }
    Device.findByDeviceID(client.deviceID, function(err, doc) {
        if (doc) {
            doc.lastDisconnected = new Date;
            doc.save();
        };
    });
});

app.listen(server_port, function() {
    console.log("MQTT:HTTP listening\nENV=\n",process.env)
});
