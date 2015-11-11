'use strict';

var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  author: {type: mongoose.Schema.ObjectId, required: true},
  topic: {type: mongoose.Schema.ObjectId, required: true},
  responseTo: {type: mongoose.Schema.ObjectId},
  created: Date.now(),
  answer: Boolean,
  comment: Boolean,
  content: String,
  likes: Number,
  views: Number
});


// UserSchema.methods.setPassword = function(password){
//   this.salt = crypto.randomBytes(16).toString('hex');
//   this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
// };

module.exports = mongoose.model('Post', PostSchema);
