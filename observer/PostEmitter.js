'use strict'

var emitter = require("events").EventEmitter;
var User = require('../models/user');
var Topic = require('../models/topic');
var Post = require('../models/post');
var Notification = require('../models/notification');
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('66b2b8969a8e0b1d6694945c0259ac12');

var api_key = 'key-b8a01d88cdbd5569b90a0836ba58f9ec';
var domain = 'sandbox070d004777eb4626becca0b49bc97acc.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});

function sendEmail(to, subject, text){
  var data = {
    from: 'darien.lombardi@gmail.com',
    to: to,
    subject: subject,
    text: text
  };
  mailgun.messages().send(data, function (error, body) {
    console.log("body: ",body);
  });
}

var PostEmitter = new emitter();


function createNotification(uid, rid, pid, postType, action, subject){
  var notification = new Notification();
  notification.actor = uid;
  notification.receiver = rid;
  notification.post = pid;
  notification.postType = postType;
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
        console.log(post);
        var newNotification = createNotification(user._id, post.author._id, post._id, post.postType, "liked","Post");
        post.author.notifications.push(newNotification);
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
  Post.findById(post.responseTo, function(err, question){
    User.findById(question.author, function(err, author){
      if(author._id.toString() !== post.author._id.toString()){
        var newNotification = createNotification(post.author, author._id, question._id, post.postType, "answered","question");
        author.notifications.push(newNotification);
        newNotification.save();
      }
      author.save();
      question.answers.push(post._id);
      question.save();
      sendEmail(author.email, "Question Answered - Quora-Clone", `${post.author.username} answered your question titled: ${question.title}`)
    });
  })
  User.findById(post.author, function(err, user){
    if(user.posts.indexOf(post._id) === -1){
      user.posts.push(post._id);
      user.save();
    };
  });
});

PostEmitter.on("addCommentToPostAndUser", function(post){
  Post.findById(post.responseTo, function(err, parentPost){
    User.findById(parentPost.author, function(err, author){
      if(author._id.toString() !== post.author._id.toString()){
        var newNotification = createNotification(post.author, author._id, parentPost._id, post.postType, "commented","post");
        author.notifications.push(newNotification);
        newNotification.save();
      }
      author.save();
      parentPost.comments.push(post._id);
      parentPost.save();
      sendEmail(author.email, "Commented on Question - Quora-Clone", `${post.author.username} commented on your post titled: ${parentPost.title}`)
    })
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
