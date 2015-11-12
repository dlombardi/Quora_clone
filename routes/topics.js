'use strict';

var express = require('express');
var router = express.Router();

var Topic = require('../models/topic');
var User = require('../models/user');

router.get('/', function(req, res, next) {

});

router.post('/addTopic', function(req, res, next) {
  console.log(req.body);
  var topic = new Topic();
  topic.name = req.body.name;
  topic.about = req.body.about;
  topic.save(function(err){
    if(err){
      return res.status(400);
    } else {
      res.send("successfully added Topic");
    }
  });
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
