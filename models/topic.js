'use strict';

var mongoose = require('mongoose');

var TopicSchema = new mongoose.Schema({
  name: String,
  subscribers: [{type: mongoose.Schema.ObjectId}],
  posts: [{type: mongoose.Schema.ObjectId}],
  about: String
});


// UserSchema.methods.setPassword = function(password){
//   this.salt = crypto.randomBytes(16).toString('hex');
//   this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
// };

module.exports = mongoose.model('Topic', TopicSchema);
