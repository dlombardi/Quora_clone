'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');

var UserEmitter = new emitter();

UserEmitter.on("createUser", function(data){
  var user = new User();
  user.username = data.username;
  user.setPassword(data.password);
  user.save();
});

UserEmitter.on("addKnowledge", function(data){
  User.findById(data.uid, function(err, user){
    Topic.find({name: data.topic}, function(err, topic){
      user.knowledge.push(topic[0]._id);
      user.save();
    })
  });
});

module.exports = UserEmitter;
