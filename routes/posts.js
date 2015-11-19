'use strict';

var express = require('express');
var shuffle = require('knuth-shuffle').knuthShuffle
var router = express.Router();
var passport = require("passport");
var marked = require('marked');
var router = express.Router();
var jwt = require('jsonwebtoken');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');

var UserEmitter = require("../observer/UserEmitter");
var TopicEmitter = require("../observer/TopicEmitter");
var PostEmitter = require("../observer/PostEmitter");

function loggedIn(req, res, next) {
  jwt.verify(req.body.token, process.env.JWT_SECRET, function(err, decoded) {
    if(decoded._id){
      User.findById(decoded._id, function(err, user){
        if(user){
          next();
        } else {
          res.redirect("/login");
        }
      })
    } else {
      res.redirect("/login");
    }
  });
}

router.get('/:pid', function(req, res, next){
  Post.findById(req.params.pid).populate('author comments.comments topic responseTo').exec(function (err, post){
    res.send(post);
  });
})

router.post('/add', loggedIn, function(req, res, next){
  switch(req.body.postType){
    case "question":
      Topic.find({name: req.body.topic}).populate("posts").exec(function(err, topic){
        if(err){res.send("error: ",err)};
        var notRepeated = topic[0].posts.every(isTitleFound);
        if(notRepeated){
          var post = new Post(req.body);
          post.topic = topic[0]._id;
          if(req.body.tags){
            post.formatTags(req.body.tags, post);
          }
          post.content = marked(post.content);
          post.save(function(err){
            console.log("post: ", post);
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
      post.content = marked(post.content);
      post.save(function(err){
        if(err){res.send("error: ",err)};
        PostEmitter.emit("addAnswerToQuestionAndUser", post);
        res.send(post);
      });
      break;
    case "comment":
      var post = new Post(req.body);
      post.content = marked(post.content);
      post.save(function(err){
        if(err){console.log("error: ",err)};
        console.log(post);
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
    if(err){res.send("error: ",err)};
    PostEmitter.emit("removePost", post)
    res.send(post);
  })
});

router.put('/changeStats', function(req, res, next){
  var EmitObject = {
    pid : req.body.pid,
    uid : req.body.uid
  }
  Post.findById(req.body.pid).populate("author").exec(function(err, post){
    if(err){res.send("error: ",err)};
    switch(req.body.type){
      case "views":
        post.views += 1;
        post.author.views += 1;
        PostEmitter.emit("viewPost", EmitObject);
        break;
      case "like":
        post.likes += 1;
        post.author.likes += 1;
        PostEmitter.emit("likePost", EmitObject);
        break;
      case "unlike":
        post.likes -= 1;
        post.author.likes -= 1;
        PostEmitter.emit("unlikePost", EmitObject);
        break;
      case "dislike":
        post.dislikes += 1;
        post.author.dislikes += 1;
        PostEmitter.emit("dislikePost", EmitObject);
        break;
      case "undo":
        post.dislikes -= 1;
        post.author.dislikes -= 1;
        PostEmitter.emit("undoDislikePost", EmitObject);
        break;
    }
    post.save();
    post.author.save();
    res.send(post);
  })
});

router.put('/edit', function(req, res, next){
  Post.findById(req.body.pid, function(err, post){
    if(err)res.send("error: ",err);
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
      sortParams = {"likes" : 'desc'};
      break;
    case "dislikes":
      sortParams = {"dislikes" : 'desc'};
      break;
    case "views":
      sortParams = {"views" : 'asc'};
      break;
    default:
      sortParams = {"likes" : 'desc'};
  }
  if(req.params.postType){
    Post.find({postType: req.params.postType}).deepPopulate("topic comments.author answers author").sort(sortParams).exec(function(err, posts){
      if(err)res.send("error: ",err);
      res.send(posts);
    });
  } else if (tag) {
    Post.find({tags: {$in: [tag]}}).sort(sortParams).exec(function(err, posts){
      if(err)res.send("error: ",err);
      res.send(posts);
    });
  } else if(req.params.tid){
    Post.find({topic : req.params.tid}).sort(sortParams).exec(function(err, posts){
      if(err)res.send("error: ",err);
      res.send(posts);
    });
  } else if(req.params.uid){
    User.findById(req.params.uid).deepPopulate('subscriptions.posts').exec(function(err, user){
      if(err)res.send("error: ",err);
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
    Post.find().deepPopulate("author comments.comments likers").sort(sortParams).exec(function(err, posts){
      if(err)res.send("error: ",err);
      res.send(posts);
    });
  }
});

router.get("/sortedComments/:sortingMethod?/post/:pid?", function(req, res, next){
  var sortingMethod = req.params.sortingMethod;
  var sortParams;
  switch(sortingMethod){
    case "newest":
      sortParams = {"updated" : 'desc'};
      break;
    case "oldest":
      sortParams = {"updated" : 'asc'};
      break;
    case "likes":
      sortParams = {"likes" : 'desc'};
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
  Post.find({responseTo: req.params.pid}).deepPopulate("author comments.comments topic").sort(sortParams).exec(function(err, posts){
    if(err){res.send("error: ",err)};
    res.send(posts);
  });
});




module.exports = router;
