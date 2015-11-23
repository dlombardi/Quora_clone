'use strict';

var express = require('express');
var router = express.Router();

var Topic = require('../models/topic');
var User = require('../models/user');
var Post = require('../models/post');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");

router.get('/allTopics', function(req, res, next) {
  Topic.find({}, function(err, topics){
    res.send(topics);
  })
});

router.get('/topic/:name', function(req, res, next) {
  Topic.find({name: req.params.name}).deepPopulate("subscribers posts.author posts").exec(function(err, topic){
    res.send(topic[0]);
  });
});

router.get('/limit7', function(req, res, next) {
  Topic.find().limit(7).exec(function(err, topics){
    res.send(topics);
  })
});

router.post('/add', function(req, res, next){
  var topic = new Topic(req.body);
  topic.save(function(err){
    res.send(topic);
  });
});

router.delete('/delete', function(req, res, next){
  topic.findByIdAndRemove(req.body.tid, function(err, topic){
    res.send(topic);
  });
});




module.exports = router;
