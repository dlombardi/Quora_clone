'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.ObjectId, required: true, ref: 'User'},
  topic: {type: mongoose.Schema.ObjectId, ref: 'Topic'},
  responseTo: {type: mongoose.Schema.ObjectId, ref: 'Post'},
  answers: [{type: mongoose.Schema.ObjectId, ref: 'Post'}],
  comments: [{type: mongoose.Schema.ObjectId, ref: 'Post'}],
  followers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  updated: { type: Date, default: Date.now },
  postType: {type: String, enum: ['question', 'answer', 'comment'], required: true},
  answerWritten: {type: Boolean, default: false},
  title: String,
  content: String,
  likers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  dislikers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  likes: {type: Number, default: 0},
  dislikes: {type: Number, default: 0},
  views: {type: Number, default: 0},
  tags: [{type: String}]
})

PostSchema.plugin(deepPopulate);

PostSchema.methods.formatTags = function(tags, post) {
  tags.split(",").forEach(function(tag){
    if(post.tags.indexOf(tag) === -1){
      post.tags.push(tag.toLowerCase().trim());
    }
  });
}

module.exports = mongoose.model('Post', PostSchema);
