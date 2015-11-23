'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('66b2b8969a8e0b1d6694945c0259ac12');

var api_key = 'key-b8a01d88cdbd5569b90a0836ba58f9ec';
var domain = 'sandbox070d004777eb4626becca0b49bc97acc.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

function sendEmail(to, subject, text){
  var data = {
    from: 'darien.lombardi@gmail.com',
    to: to,
    subject: subject,
    text: text
  };
  mailgun.messages().send(data, function (error, body) {
    console.log("body: ",body);
  });
}

var UserEmitter = new emitter();

UserEmitter.on("createUser", function(user){
  mixpanel.track("Created User", {
    uid: user._id,
    name: user.fullName,
    email: user.email,
    username: user.username
  });
  sendEmail(user.email, "Welcome to the Quora-Clone!", "Thanks for signing up.  Hope you enjoy the experience!")
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
