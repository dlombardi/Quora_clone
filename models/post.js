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

PostSchema.methods.formatTags =  (tags, post) => {
  tags.split(",").forEach((tag) => {
    if(post.tags.indexOf(tag) === -1){
      post.tags.push(tag.toLowerCase().trim());
    }
  });
}

PostSchema.statics.filterPostType = function(postType, sortParams, cb){
  return this.find({postType: postType}).deepPopulate("topic comments.author answers author").sort(sortParams).exec(cb);
}

PostSchema.statics.filterByTag = function(tag, sortParams, cb){
  return this.find({tags: {$in: [tag]}}).sort(sortParams).deepPopulate("author topic").exec(cb)
}

PostSchema.statics.filterByTopic = function(tid, sortParams, cb){
  return this.find({topic:tid}).sort(sortParams).exec(cb)
}

PostSchema.statics.findAll = function(sortParams, cb){
  return this.find({}).deepPopulate("author comments.comments likers").sort(sortParams).exec(cb)
}


module.exports = mongoose.model('Post', PostSchema);
