'use strict';

var express = require('express');
var shuffle = require('knuth-shuffle').knuthShuffle
var router = express.Router();

var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');


var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");

router.get('/:pid', function(req, res, next){
  Post.findById(req.params.pid).populate('author comments.comments topic responseTo').exec(function (err, post){
    res.send(post);
  });
})

router.post('/add', function(req, res, next){
  switch(req.body.postType){
    case "question":
      Topic.findById(req.body.topic).populate("posts").exec(function(err, topic){
        var notRepeated = topic.posts.every(isTitleFound);
        if(notRepeated){
          var post = new Post(req.body);
          if(req.body.tags){
            post.formatTags(req.body.tags, post);
          }
          post.save(function(err){
            PostEmitter.emit("addQuestionToTopicAndUser", post);
            res.send(post);
          });
        } else {
          res.send("attempting to submit an already existing post")
        }
      });
      break;
    case "answer":
      var post = new Post(req.body);
      post.save(function(err){
        PostEmitter.emit("addAnswerToQuestionAndUser", post);
        res.send(post);
      });
      break;
    case "comment":
      var post = new Post(req.body);
      post.save(function(err){
        PostEmitter.emit("addCommentToPostAndUser", post);
        res.send(post);
      });
      break;
  }
  function isTitleFound(post){
    return post.title !== req.body.title;
  }
});

router.delete('/delete', function(req, res, next){
  Post.findByIdAndRemove(req.body.pid, function(err, post){
    PostEmitter.emit("removePost", post)
    res.send(post);
  })
});

router.put('/changeStats', function(req, res, next){
  Post.findById(req.body.pid).populate("author").exec(function(err, post){
    switch(req.body.type){
      case "views":
        post.views += 1;
        post.author.views += 1;
        break;
      case "like":
        post.likes += 1;
        post.author.likes += 1;
        break;
      case "dislike":
        post.likes -= 1;
        post.author.likes -= 1;
        break;
    }
    PostEmitter.emit("changePostStats", post);
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
        post.formatTags(req.body.tags, post)
      }
      post.save(function(err){
        PostEmitter.emit("addPostToTopicAndUser", post);
        res.send(post);
      });
    } else {
      res.send("unauthorized edit; user not author")
    }
  })
});

router.get('/sorted/:sortingMethod?/user/:uid?/topic/:tid?/tag/:tag?/postType/:postType?', function(req, res, next){
  var tag = req.params.tag
  var sortingMethod = req.params.sortingMethod;
  var sortParams;
  var postType;
  switch(sortingMethod){
    case "newest":
      sortParams = {"updated" : 'desc'};
      break;
    case "oldest":
      sortParams = {"updated" : 'asc'};
      break;
    case "likes":
      sortParams = {"likes" : 'asc'};
      break;
    case "dislikes":
      sortParams = {"likes" : 'desc'};
      break;
    case "views":
      sortParams = {"views" : 'asc'};
      break;
    default:
      sortParams = {"likes" : 'desc'};
  }
  if(req.params.postType){
    Post.find({postType: req.params.postType}).populate("topic author").sort(sortParams).exec(function(err, posts){
      res.send(posts);
    });
  } else if (tag) {
    Post.find({topic : req.params.tid, tags: {$in: [tag]}}).sort(sortParams).exec(function(err, posts){
      res.send(posts);
    });
  } else if(req.params.tid){
    Post.find({topic : req.params.tid}).sort(sortParams).exec(function(err, posts){
      res.send(posts);
    });
  } else if(req.params.uid){
    User.findById(req.params.uid).deepPopulate('subscriptions.posts').exec(function(err, user){
      var subscribedPosts = [];
      user.subscriptions.forEach(function(subscription){
        subscription.posts.forEach(function(post){
          subscribedPosts.push(post);
        })
      })
      var rankedSubscribedPosts = subscribedPosts.sort(function(a, b){
        return ((b.likes + b.views) / 2) - ((a.likes + a.views) / 2);
      })
      res.send(rankedSubscribedPosts);
    });
  } else {
    Post.find().sort(sortParams).exec(function(err, posts){
      res.send(posts);
    });
  }
});


module.exports = router;
