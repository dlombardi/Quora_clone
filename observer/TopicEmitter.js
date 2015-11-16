'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('66b2b8969a8e0b1d6694945c0259ac12');

var TopicEmitter = new emitter();

TopicEmitter.on("addTopic", function(data){
  var topic = new Topic(data);
  topic.save();
});

TopicEmitter.on("addTopic", function(data){
  User.findById(data.uid, function(err, user){
    Topic.find({name: data.topic}, function(err, topic){
      user.knowledge.push(topic[0]._id);
      user.save();
    })
  });
});

module.exports = TopicEmitter;
