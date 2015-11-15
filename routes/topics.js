'use strict';

var express = require('express');
var router = express.Router();

var Topic = require('../models/topic');
var User = require('../models/user');
var Post = require('../models/post');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");

router.get('/', function(req, res, next) {
  Topic.find({}, function(err, topics){
    res.send(topics);
  })
});

router.post('/add', function(req, res, next){
  var topic = new Topic(req.body);
  topic.save(function(err, topic){
    res.send(topic);
  });
});

router.delete('/delete', function(req, res, next){
  topic.findByIdAndRemove({name: req.body.name}, function(err, topic){
    res.send(topic);
  });
});




module.exports = router;
