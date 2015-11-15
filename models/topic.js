'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var TopicSchema = new mongoose.Schema({
  name: {type: String, required: true},
  about: {type: String, required: true},
  subscribers: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  posts: [{type: mongoose.Schema.ObjectId, ref: 'Post'}]
});

TopicSchema.plugin(deepPopulate);

module.exports = mongoose.model('Topic', TopicSchema);
