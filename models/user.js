'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  username: {type: String, lowercase: true, unique: true},
  fullName: {type: String, lowercase: true},
  email: String,
  home: String,
  work: String,
  about: String,
  education: [String],
  subscriptions: [{ type: mongoose.Schema.ObjectId, ref: "Topic" }],
  knowledge: [{ type: mongoose.Schema.ObjectId }],
  followers: [{ type: mongoose.Schema.ObjectId }],
  following: [{ type: mongoose.Schema.ObjectId }],
  posts: [{ type: mongoose.Schema.ObjectId }],
  karma: Number,
  views: Number,
  hash: String,
  salt: String
});

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

module.exports = mongoose.model('User', UserSchema);
