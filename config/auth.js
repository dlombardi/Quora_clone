'use strict';

var jwt = require('express-jwt');

var auth = jwt({secret: process.env.JWT_SECRET, userProperty: 'payload'});

module.exports = auth;
