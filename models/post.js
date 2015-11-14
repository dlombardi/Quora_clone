'use strict';

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.ObjectId, required: true, ref: 'User'},
  topic: {type: mongoose.Schema.ObjectId, required: true, ref: 'Topic'},
  responseTo: {type: mongoose.Schema.ObjectId, ref: 'Post'},
  comments: [{type: mongoose.Schema.ObjectId, ref: 'Post'}],
  updated: { type: Date, default: Date.now },
  postType: {type: String, enum: ['question', 'answer', 'comment']},
  title: String,
  content: String,
  likes: {type: Number, default: 0},
  views: {type: Number, default: 0},
  tags: [{type: String}]
});


module.exports = mongoose.model('Post', PostSchema);
