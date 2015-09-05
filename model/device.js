#!/usr/bin/env node
/*
broker © 2015
*/

var mongoose = require('../mongoose');

var schema = new mongoose.Schema({
    deviceID: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    topic: {
        type: String,
        required: true
    },
    app : {
        type: String,
        required: true
    },
    created: {
        type: Date,
        'default': Date.now()
    },
    createdBy: mongoose.Schema.Types.ObjectId,
    activationTime: {
        type: Date,
        'default': Date.now()
    },
    secret: String,
    companyID: String,
    customerID: String,
    groupID: String,
    lastConnected: Date,
    lastSubscribed: Date,
    lastDisconnecting: Date,
    lastDisconnected: Date,
    lastPublished: Array,
    lastVoltage: String,
    lastSSRI: String,
    clientObject: Object,
    latestIP: String
}, {
    versionKey: false
});

schema.statics.findByDeviceID = function(deviceID, cb) {
    mongoose.model('Device').findOne({deviceID: deviceID}, function(err, doc) {
        if (err || !doc || doc.deviceID !== deviceID) return cb(true);
        return cb(null, doc);
    });
}

schema.statics.topicAuthorized = function(deviceID, topic, cb) {
    mongoose.model('Device').findOne({deviceID: deviceID}, function(err, doc) {
        var _topic = '/' + doc.topic + '/' + doc.deviceID + '/' + doc.app;
        console.log(_topic)
        cb(err, (topic===_topic));
    });
}

schema.methods.mqtt = function() {
    return '/' + this.topic + '/' + this.deviceID + '/' + this.app;
};

schema.methods.pubQueue = function(pub) {
    this.lastPublished = this.lastPublished || [];
    if (++this.lastPublished.length > 10) this.lastPublished.pop();
    this.lastPublished.unshift(pub);
    this.save();
};

exports.Device = mongoose.model('Device', schema);
