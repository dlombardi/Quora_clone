'use strict';

var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var notificationSchema = new mongoose.Schema({
  actor: {type: mongoose.Schema.ObjectId, ref: 'User'},
  receiver: {type: mongoose.Schema.ObjectId, ref: 'User'},
  post: {type: mongoose.Schema.ObjectId, ref: 'Post'},
  date: {type: Date, default: Date.now},
  postType: String,
  seen: {type: Boolean, default: false},
  action: String,
  subject: String,

})

notificationSchema.plugin(deepPopulate);

module.exports = mongoose.model('Notification', notificationSchema);
