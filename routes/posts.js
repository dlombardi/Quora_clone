'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');


var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");


router.get('/', function(req, res, next) {

});

router.post('/add', function(req, res, next){
  var post = new Post(req.body);
  post.save(function(err, post){
    PostEmitter.emit("addPostToTopicAndUser", post)
    res.send(post);
  });
});

router.delete('/delete', function(req, res, next){
  Post.findByIdAndRemove(req.body.pid, function(err, post){
    PostEmitter.emit("removePostFromTopic", post)
    res.send(post);
  })
});

router.post('/visit', function(req, res, next){
  Post.findById(req.body.pid).populate("author").exec(function(err, post){
    var viewBool = req.body.type === "views";
    viewBool ? post.views += 1 : post.likes += 1;
    viewBool ? post.author.views += 1 : post.author.likes += 1;
    post.save();
    post.author.save();
    viewBool ? PostEmitter.emit("viewPost", post, post.author) : PostEmitter.emit("likePost", post, post.author);
    res.send(post);
  })
});

router.put('/edit', function(req, res, next){
  Post.findById(req.body.pid, function(err, post){
    if(post.author.toString() === req.body.uid.toString()){
      post.content = req.body.content;
      post.updated = Date.now();
      if(req.body.tags){
        var tags = req.body.tags.split(",");
        tags.forEach(function(tag){
          if(post.tags.indexOf(tag) === -1){
            post.tags.push(tag.toLowerCase());
          }
        });
      }
      post.save();
      res.send(post);
    } else {
      res.send("unauthorized edit; user not author")
    }
  })
});

router.get('/viewAndLikeRanked/:tid', function(req, res, next){
  Topic.findById(req.params.pid).populate("author").exec(function(err, post){

  })
});


module.exports = router;
