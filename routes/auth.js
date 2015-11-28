'use strict';

var express = require('express');
var shuffle = require('knuth-shuffle').knuthShuffle
var router = express.Router();
var passport = require("passport");
var marked = require('marked');
var router = express.Router();
var multer = require('multer');
var upload = multer({ storage: multer.memoryStorage() });

var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.post('/register', upload.single('file'), function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }

  let profilePicture = new Buffer(req.file.buffer).toString('base64');
  let data = req.body;

  let user = new User();
  user.picture = profilePicture;
  user.fullName = data.fullName;
  user.username = data.username;
  user.email = data.email;
  user.password = user.setPassword(data.password);

  user.save(function(err){
   if(err){
     return res.status(400).json({error: err});
   }
  //  UserEmitter.emit("createUser", user);
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
