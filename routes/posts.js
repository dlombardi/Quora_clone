'use strict';

var express = require('express');
var router = express.Router();

// Serve out Angular
router.get('/', function(req, res, next) {
  console.log("in posts router")
});

module.exports = router;
