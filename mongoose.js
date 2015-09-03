#!/usr/bin/env node
/*
broker © 2015
*/

var config = require(process.env.CONFIGJSON);
var mongoose = require('mongoose');

module.exports = mongoose.createConnection(config.url, config.options);
module.exports.Schema = mongoose.Schema;