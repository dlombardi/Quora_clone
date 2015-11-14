'use strict';

var mongoose = require('mongoose');

var TopicSchema = new mongoose.Schema({
  name: {type: String, required: true},
  about: {type: String, required: true},
  subscribers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  posts: [{type: mongoose.Schema.ObjectId, ref: 'Post'}]
});


module.exports = mongoose.model('Topic', TopicSchema);
