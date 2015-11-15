'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');

var PostEmitter = new emitter();

PostEmitter.on("addPost", function(data){
  console.log(data);
});

PostEmitter.on("changePostStats", function(post, author){
  User.findById(post.author)
});

PostEmitter.on("likePost", function(data){
  console.log(data);
});

PostEmitter.on("addPostToTopicAndUser", function(post){
  Topic.findById(post.topic, function(err, topic){
    if(topic.posts.indexOf(post._id) === -1){
      topic.posts.push(post._id);
      topic.save();
    }
  });
  User.findById(post.author, function(err, user){
    if(user.posts.indexOf(post._id) === -1){
      user.posts.push(post._id);
      user.save();
    };
  });
});


PostEmitter.on("removePostFromTopicAndUser", function(post){
  Topic.findById(post.topic, function(err, topic){
    topic.posts.forEach(function(topicPost, i){
      if(topicPost.toString() === post._id.toString()){
        topic.posts.splice(i, 1)
        topic.save();
      }
    });
  });
  User.findById(post.author, function(err, user){
    user.posts.forEach(function(userPost, i){
      if(userPost.toString() === post._id.toString()){
        user.posts.splice(i, 1)
        user.save();
      }
    });
  });
});



module.exports = PostEmitter;
