'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');
var Topic = require('../models/topic');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }
  UserEmitter.emit("createUser", req.body);
  res.send("registered User");
});


router.post('/knowledge', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  UserEmitter.emit("addKnowledge", req.body);
  res.send("added topic of expertise to user profile");
});



router.post('/updateInfo', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  UserEmitter.emit("updateInfo", req.body);
  res.send("Updated User Info");
});

router.post('/following', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  UserEmitter.emit("following", req.body);
  res.send("Updated following and follower Info for users");
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
