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
  Topic.findById(req.body.tid).populate("posts").exec(function(err, topic){
    var repeated = topic.posts.every(isTitleFound);
    if(repeated){
      var post = new Post(req.body);
      post.save(function(err, post){
        PostEmitter.emit("addPostToTopicAndUser", post)
        res.send(post);
      });
    } else {
      res.send("attempting to submit an already existing post")
    }
  });
  function isTitleFound(post, index, array){
    return post.title.toLowerCase() !== req.body.title.toLowerCase();
  }
});

router.delete('/delete', function(req, res, next){
  Post.findByIdAndRemove(req.body.pid, function(err, post){
    PostEmitter.emit("removePostFromTopicAndUser", post)
    res.send(post);
  })
});

router.put('/changeStats', function(req, res, next){
  Post.findById(req.body.pid).populate("author").exec(function(err, post){
    switch(req.body.type){
      case "views":
        post.views += 1;
        break;
      case "like":
        // post.likers.push(req.body.uid);
        post.likes += 1;
        break;
      case "unlike":
        post.likes -= 1;
        break;
    }
    PostEmitter.emit("changePostStats", post, post.author);
    post.save();
    post.author.save();
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
      PostEmitter.emit("addPostToTopicAndUser", post);
      post.save();
      res.send(post);
    } else {
      res.send("unauthorized edit; user not author")
    }
  })
});

router.get('/viewAndLikeRanked', function(req, res, next){
  var topPosts = [];
  Topic.find({}, function(err, topics){
    topics.forEach(function(topic, i){
      topic.posts.views.sort(function(a, b){

      })
    })
  });
});


module.exports = router;
