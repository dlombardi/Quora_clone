'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');

var PostEmitter = new emitter();

PostEmitter.on("addPost", function(data){
  console.log(data);
});

PostEmitter.on("viewPost", function(data){
  console.log(data);
});

PostEmitter.on("likePost", function(data){
  console.log(data);
});

PostEmitter.on("addPostToTopicAndUser", function(post){
  Topic.findById(post.topic, function(err, topic){
    topic.posts.forEach(function(topicPost, i){
      if(topicPost.toString() === post._id.toString()){
        topic.posts.splice(i, post)
        topic.save();
      } else {
        topic.posts.push(post._id);
        topic.save();
      }
    });
  });
  User.findById(post.author, function(err, user){
    user.posts.forEach(function(userPost, i){
      if(userPost.toString() === post._id.toString()){
        user.posts.splice(i, post)
        user.save();
      } else {
        user.posts.push(post._id);
        user.save();
      }
    });
  });
});


PostEmitter.on("removePostFromTopic", function(post){
  Topic.findById(post.topic, function(err, topic){
    topic.posts.forEach(function(topicPost, i){
      if(topicPost.toString() === post._id.toString()){
        topic.posts.splice(i, 1)
        topic.save();
      }
    });
  });
});



module.exports = PostEmitter;
