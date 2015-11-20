'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');
var Notification = require('../models/notification');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('66b2b8969a8e0b1d6694945c0259ac12');

var PostEmitter = new emitter();


function createNotification(uid, rid, pid, action, subject){
  var notification = new Notification();
  notification.actor = uid;
  notification.receiver = rid;
  notification.post = pid;
  notification.action = action;
  notification.subject = subject;
  return notification;
}

PostEmitter.on("addPost", function(data){
  console.log(data);
});

PostEmitter.on("viewPost", function(post, author){
  User.findById(post.uid, function(err, user){

  })
});

PostEmitter.on("likePost", function(data){
  Post.findById(data.pid).deepPopulate("author.notifications").exec(function(err, post){
    User.findById(data.uid, function(err, user){
      if(post.author._id.toString() !== user._id.toString()){
        post.author.notifications.push(newNotification);
        var newNotification = createNotification(user._id, post.author._id, post._id, "liked","Post");
        newNotification.save();
      }
      post.author.save();
      post.likers.push(user._id);
      user.save();
      post.save();
    });
  });
});

PostEmitter.on("unlikePost", function(data){
  Post.findById(data.pid).deepPopulate("author.notifications").exec(function(err, post){
    User.findById(data.uid, function(err, user){
      if(post.author.notifications.length <= 0){
        post.author.notifications.forEach(function(notification, i){
          if(notification.actor.toString() === user._id.toString()){
            post.author.notifications.splice(i, 1);
          }
        })
      }
      user.postLikes.forEach(function(likedPost, i){
        if(post._id.toString() === likedPost.toString()){
          user.postLikes.splice(i, 1);
        }
      });
      post.likers.forEach(function(liker, i){
        if(user._id.toString() === liker.toString()){
          post.likers.splice(i, 1);
        }
      })
      post.author.save();
      user.save();
      post.save();
    });
  });
});

PostEmitter.on("dislikePost", function(data){
  Post.findById(data.pid, function(err, post){
    User.findById(data.uid, function(err, user){
      user.postDislikes.push(post._id);
      post.dislikers.push(user._id);
      user.save();
      post.save();
    });
  });
});

PostEmitter.on("undoDislikePost", function(data){
  Post.findById(data.pid, function(err, post){
    User.findById(data.uid, function(err, user){
      user.postDislikes.forEach(function(dislikedPost, i){
        if(post._id.toString() === dislikedPost.toString()){
          user.postDislikes.splice(i, 1);
        }
      });
      post.dislikers.forEach(function(disliker, i){
        if(user._id.toString() === disliker.toString()){
          post.dislikers.splice(i, 1);
        }
      })
      user.save();
      post.save();
    });
  });
});

PostEmitter.on("addQuestionToTopicAndUser", function(post){
  Topic.findById(post.topic, function(err, topic){
    if(topic.posts.indexOf(post._id) === -1){
      topic.posts.push(post._id);
      topic.save();
    }
  });
  User.findById(post.author, function(err, user){
    if(user.posts.indexOf(post._id) === -1){
      user.posts.push(post._id);
      user.save();
    };
  });
});

PostEmitter.on("addAnswerToQuestionAndUser", function(post){
  Post.findById(post.responseTo, function(err, post){
    post.answers.push(post._id);
    post.save();
  });
  User.findById(post.author, function(err, user){
    if(user.posts.indexOf(post._id) === -1){
      user.posts.push(post._id);
      user.save();
    };
  });
});

PostEmitter.on("addCommentToPostAndUser", function(post){
  Post.findById(post.responseTo, function(err, parentPost){
    parentPost.comments.push(post._id);
    parentPost.save();
  });
  User.findById(post.author, function(err, user){
    if(user.posts.indexOf(post._id) === -1){
      user.posts.push(post._id);
      user.save();
    };
  });
});


PostEmitter.on("removePost", function(post){
  switch(post.postType){
    case "question":
      Topic.findById(post.topic, function(err, topic){
        topic.posts.forEach(function(topicPost, i){
          if(topicPost.toString() === post._id.toString()){
            topic.posts.splice(i, 1)
            topic.save();
          }
        });
      });
      break;
    case "answer":
      Post.findById(post.responseTo, function(err, parentPost){
        parentPost.answers.forEach(function(answer){
          if(answer.toString() === post._id.toString()){
            parentPost.answers.splice(i, 1);
            parentPost.save();
          }
        })
      })
      User.findById(post.author, function(err, user){
        user.posts.forEach(function(userPost, i){
          if(userPost.toString() === post._id.toString()){
            user.posts.splice(i, 1)
            user.save();
          }
        });
      });
      break;
    case "comment":
      Post.findById(post.responseTo, function(err, parentPost){
        parentPost.comments.forEach(function(comment){
          if(comment.toString() === post._id.toString()){
            parentPost.comments.splice(i, 1);
            parentPost.save();
          }
        })
      })
      User.findById(post.author, function(err, user){
        user.posts.forEach(function(userPost, i){
          if(userPost.toString() === post._id.toString()){
            user.posts.splice(i, 1)
            user.save();
          }
        });
      });
      break;
  }
});




module.exports = PostEmitter;
