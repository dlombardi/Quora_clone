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

PostEmitter.on("addPostToTopic", function(post){
  Topic.findById(post.topic, function(err, topic){
    topic.posts.push(post._id);
    topic.save();
  });
});

PostEmitter.on("removePostFromTopic", function(post){
  Topic.findById(post.topic, function(err, topic){
    topic.posts.forEach(function(topicPosts, i){

    });
  });
});



module.exports = PostEmitter;
