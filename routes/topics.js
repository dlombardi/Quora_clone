'use strict';

var express = require('express');
var router = express.Router();

var Topic = require('../models/topic');
var User = require('../models/user');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");

router.get('/', function(req, res, next) {
  if(!req.body){
    return res.send("no entry");
  }
  TopicEmitter.emit("createUser", req.body);
  TopicEmitter.on("successfullyCreatedUser", function(data){
    
  })
  res.send(req.body)
});

router.post('/addTopic', function(req, res, next) {
  console.log(req.body);
});

router.post('/addSubscriber', function(req, res, next){
  console.log(req.body);
  Topic.find({name: req.body.name}, function(err, topic){
    User.findById(req.body.uid, function(err, user){
      console.log("topic", topic[0]);
      console.log("user", user);
      topic[0].subscribers.push(user._id);
      topic[0].save(function(err){
        err ? res.status(400) : res.send("added subscriber to topic");
      });
    });
  });
});



module.exports = router;
