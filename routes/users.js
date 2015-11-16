'use strict';

var express = require('express');
var router = express.Router();
var passport = require('passport');

var User = require('../models/user');
var Topic = require('../models/topic');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }
  var user = new User();
  user.username = req.body.username;
  user.setPassword(req.body.password)

  user.save(function (err, user){
   if(err){
     return res.status(400).json({error: err});
   }
   UserEmitter.emit("createUser", user);
   return res.json({token: user.generateJWT()})
 });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Missing required fields username and password.'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){
      return res.status(400).json({error: err});
    }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/addknowledge', function(req, res, next){
  if(!req.body){
    return res.send("no entry");
  }
  User.findById(req.body.uid, function(err, user){
    Topic.find({name: req.body.topic}, function(err, topic){
      user.knowledge.push(topic[0]._id);
      user.save(function(err, user){
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

  updateInfo(req.body.uid, req.body.type, req.body.content);

  function updateInfo(uid, infoType, content){
    var infoObj = {};
    var type = infoType;
    infoObj[type] = content;
    User.findByIdAndUpdate(uid, { $set: infoObj }, function(err, user){
      user.save();
      UserEmitter.emit("updateInfo", user);
      res.send(user);
    });
  }
});

router.post('/follow', function(req, res, next){
  User.findById(req.body.uid, function (err, follower){
    User.findById(req.body.rid, function(err, receiver){
      if(follower.following.indexOf(req.body.rid) === -1){
        follower.following.push(req.body.rid);
        follower.save();
        UserEmitter.emit("following", receiver, req.body.uid);
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
          UserEmitter.emit("removeFollowing", receiver, req.body.uid);
          res.send(follower);
        }
      });
    })
  });
});

router.post('/subscribe', function(req, res, next){
  Topic.findById(req.body.tid, function(err, topic){
    User.findById(req.body.uid, function(err, user){
      topic.subscribers.push(user._id);
      user.subscriptions.push(topic._id);
      topic.save();
      user.save();
      res.send(topic, user);
    });
  });
});

router.put('/unsubscribe', function(req, res, next){
  Topic.findById(req.body.tid, function(err, topic){
    User.findById(req.body.uid, function(err, user){
      console.log(typeof(topic._id.toString()))
      console.log(typeof(req.body.tid));
      user.subscriptions.forEach(function(topic, i){
        if(topic.toString() === req.body.tid.toString()){
          user.subscriptions.splice(i, 1);
        }
      })
      topic.subscribers.forEach(function(user, i){
        if(user.toString() === req.body.uid.toString()){
          topic.subscribers.splice(i, 1);
        }
      })
      topic.save();
      user.save();
      res.send(user);
    });
  });
});



module.exports = router;
