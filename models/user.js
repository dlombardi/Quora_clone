'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var gridfstore = require('gridfstore');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var UserSchema = new mongoose.Schema({
  username: {type: String, unique: true},
  fullName: {type: String, lowercase: true},
  picture: String,
  email: String,
  home: String,
  work: String,
  about: String,
  subscriptions: [{ type: mongoose.Schema.ObjectId, ref: "Topic" }],
  knowledge: [{ type: mongoose.Schema.ObjectId, ref: "Topic" }],
  followers: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  posts: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  postLikes: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  postDislikes: [{ type: mongoose.Schema.ObjectId, ref: "Post" }],
  notifications: [{ type: mongoose.Schema.ObjectId, ref: "Notification" }],
  likes: {type: Number, default: 0},
  dislikes: {type: Number, default: 0},
  views: {type: Number, default: 0},
  hash: String,
  salt: String
});

UserSchema.plugin(deepPopulate);

// used for registration
UserSchema.methods.setPassword = function(password){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

// used for login
UserSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {
  // set expiration to 60 days
  var today = new Date();
  var exp = new Date(today);

  exp.setDate(today.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000),
  }, process.env.JWT_SECRET);
};

UserSchema.statics.sortBySubscriptions = function(uid, cb){
  return this.findById(uid).deepPopulate('subscriptions.posts').exec(cb)
}


module.exports = mongoose.model('User', UserSchema);
