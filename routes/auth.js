'use strict';

var express = require('express');
var shuffle = require('knuth-shuffle').knuthShuffle
var router = express.Router();
var passport = require("passport");
var marked = require('marked');
var router = express.Router();

var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password);

  user.save(function(err){
   if(err){
     return res.status(400).json({error: err});
   }
   UserEmitter.emit("createUser", user);
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
