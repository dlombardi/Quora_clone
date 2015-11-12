'use strict';

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.ObjectId, required: true},
  topic: {type: mongoose.Schema.ObjectId, required: true},
  responseTo: {type: mongoose.Schema.ObjectId},
  comments: [{type: mongoose.Schema.ObjectId}],
  created: Date.now(),
  postType: {type: String, enum:["question", "answer", "comment"], require: true},
  content: String,
  likes: Number,
  views: Number
});



module.exports = mongoose.model('Post', PostSchema);
