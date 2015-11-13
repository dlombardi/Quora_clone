'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');

var TopicEmitter = new emitter();

TopicEmitter.on("createUser", function(data){
  var topic = new Topic(data);
  topic.save();
});

TopicEmitter.on("addKnowledge", function(data){
  User.findById(data.uid, function(err, user){
    Topic.find({name: data.topic}, function(err, topic){
      user.knowledge.push(topic[0]._id);
      user.save();
    })
  });
});

module.exports = TopicEmitter;
