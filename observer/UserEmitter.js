'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');

var UserEmitter = new emitter();

UserEmitter.on("createUser", function(data){
  var user = new User(data);
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

UserEmitter.on("updateInfo", function(data){
  var infoDataType = data.type.toLowerCase();
  var uid = data.uid;
  var content = data.content;
  function updateInfo(uid, infotype, content){
    var infoObj = {};
    var type = infotype;
    infoObj[type] = content;
    User.findByIdAndUpdate(uid, { $set: infoObj }, function(err, user){
      user.save();
    });
  }
  updateInfo(data.uid, infoDataType, data.content);
});

UserEmitter.on("addToFollowing", function(data){
  User.findById(data.uid, function (err, follower) {
    User.findById(data.rid, function(err, receiver){
      follower.push()
    })
  });
});

module.exports = UserEmitter;
