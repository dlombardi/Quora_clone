'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');

router.post('/register', function(req, res, next){
  console.log('req.body:', req.body);
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }

  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){
      return res.status(400).json({error: err});
    }
    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){
      return res.status(400).json({error: err});
    }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

module.exports = router;
