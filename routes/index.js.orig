'use strict';

var express = require('express');
var router = express.Router();

// Serve out Angular
router.get('/*', function(req, res, next) {
  console.log("HIT");
  res.render('index', {title: 'TITLE'});
});

module.exports = router;
