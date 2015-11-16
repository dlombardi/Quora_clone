'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('66b2b8969a8e0b1d6694945c0259ac12');

var UserEmitter = new emitter();

UserEmitter.on("createUser", function(user){
  mixpanel.track("Created User", {
    uid: user._id,
    name: user.fullName,
    email: user.email,
    username: user.username
  });
});

UserEmitter.on("addKnowledge", function(data){
  console.log(data);
});

UserEmitter.on("updateInfo", function(user){
  console.log(user);
});

UserEmitter.on("following", function(receiver, uid){
  receiver.followers.push(uid)
  receiver.save();
});

UserEmitter.on("removeFollowing", function(receiver, uid){
  receiver.followers.forEach(function(person, i){
    if(person.toString() === uid.toString()){
      receiver.followers.splice(i, 1);
      receiver.save();
    }
  });
});

module.exports = UserEmitter;
