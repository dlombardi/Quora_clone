'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');
var Q = require('q');

var User = require('../models/user');
var Topic = require('../models/topic');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.get('/:uid', function(req, res, next){
  if(!req.params.uid){
    return res.send("no entry");
  }
  User.findById(req.params.uid).deepPopulate("posts.author posts.topic notifications.actor notifications.receiver subscriptions.posts").exec(function(err, user){
    res.send(user);
  });
});

router.post('/addknowledge', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  User.findById(req.body.uid, function(err, user){
    Topic.find({name: req.body.topic}, function(err, topic){
      user.knowledge.push(topic[0]._id);
      user.save(function(err){
        UserEmitter.emit("addKnowledge", user);
        res.send(user);
      });
    })
  });
});

router.put('/updateInfo', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  let uid = req.body.uid;
  delete req.body.uid;
  let promises = [];
  for(let key in req.body){
    let set = {$set: {}}
    set.$set[key] = req.body[key]
    let promise = Q(User.findByIdAndUpdate(uid, set).exec());
    promises.push(promise);
  }
  Q.all(promises)
  .then(() => {
    User.findById(uid).deepPopulate("posts.topic posts.comments").exec(function(err, user){
      res.send(user);
    });
  })
  .catch(err => {
    console.log("failed to update info: ");
    console.error(err);
  })
});

router.get('/notifications/:uid', function(req, res, next){
  User.findById(req.params.uid).deepPopulate("notifications.actor notifications.receiver notifications.post").exec(function(err, user){
    console.log("USER: ", user);
    res.send(user);
  });
});

router.post('/clearNotifications', function(req, res, next){
  User.findById(req.body.uid).populate("notifications").exec(function(err, user){
    user.notifications.forEach(function(notif){
      notif.seen = true;
      notif.save();
    })
    user.save();
    res.send(user);
  });
});

router.post('/follow', function(req, res, next){
  User.findById(req.body.uid, function (err, follower){
    User.findById(req.body.rid, function(err, receiver){
      if(follower.following.indexOf(receiver._id) === -1){
        follower.following.push(receiver._id);
        follower.save();
        UserEmitter.emit("following", receiver, follower._id);
        res.send(follower);
      } else {
        res.send("follower subscription already exists")
      }
    })
  });
});

router.put('/unfollow', function(req, res, next){
  User.findById(req.body.uid, function (err, follower){
    User.findById(req.body.rid, function(err, receiver){
      follower.following.forEach(function(person, i){
        if(person.toString() === receiver._id.toString()){
          follower.following.splice(i, 1);
          follower.save();
          UserEmitter.emit("removeFollowing", receiver, follower._id);
          res.send(follower);
        }
      });
    })
  });
});

router.post('/subscribe', function(req, res, next){
  Topic.find({name: req.body.topic}, function(err, topic){
    User.findById(req.body.uid, function(err, user){
      topic[0].subscribers.push(user._id);
      user.subscriptions.push(topic[0]._id);
      topic[0].save();
      user.save();
      res.send(user);
    });
  });
});

router.put('/unsubscribe', function(req, res, next){
  Topic.find({name:req.body.topic}, function(err, topic){
    User.findById(req.body.uid, function(err, user){
      console.log(user);
      user.subscriptions.forEach(function(subscribedtopic, i){
        console.log(topic);
        if(subscribedtopic.toString() === topic[0]._id.toString()){
          user.subscriptions.splice(i, 1);
        }
      })
      topic[0].subscribers.forEach(function(topicSubscriber, i){
        if(topicSubscriber.toString() === user._id.toString()){
          topic[0].subscribers.splice(i, 1);
        }
      })
      topic[0].save();
      user.save();
      res.send(user);
    });
  });
});



module.exports = router;
