'use strict';

app.controller('threadCtrl', function($scope, $state, auth, postFactory, $rootScope, $stateParams){
  $scope.displayAnswerForm = false;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  $scope.answers;
  $scope.comments;
  $scope.question;

  ($scope.getPost = function(){
    var postObject = {
      pid: $stateParams.thread
    }
    postFactory.getPost(postObject)
    .success(function(question){
      $scope.question = question;
      $scope.topic = question.topic;
      $scope.comments = question.comments;
      var sortingObject = {
        sortingMethod: "likes",
        pid: question._id
      }
      postFactory.getSortedAnswers(sortingObject)
      .success(function(answers){
        postFactory.formatLikedPosts(answers, currentUser);
        $scope.answers = answers
      })
    })
    .error(function(err){
      console.log(err);
    });
  })();

  $scope.submitAnswer = function(answer, question){
    var answerObject = {
      content: answer,
      author: currentUser._id,
      responseTo: question._id,
      postType: "answer",
      token: auth.getToken()
    }
    postFactory.createPost(answerObject)
    .success(function(answer){
      $scope.answers.push(answer);
      console.log(answer);
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.toggleAnswerLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.answers[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.answers[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.answers[index].likes += 1
          $scope.answers[index].liked = true;
        } else {
          $scope.answers[index].likes -= 1;
          $scope.answers[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleAnswerDislike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.answers[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.answers[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "dislike"){
          $scope.answers[index].dislikes += 1
          $scope.answers[index].disliked = true;
        } else {
          $scope.answers[index].dislikes -= 1;
          $scope.answers[index].disliked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleCommentLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.comments[index].likes += 1
          $scope.comments[index].liked = true;
        } else {
          $scope.comments[index].likes -= 1;
          $scope.comments[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleCommentDislike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "dislike"){
          $scope.comments[index].dislikes += 1
          $scope.comments[index].disliked = true;
        } else {
          $scope.comments[index].dislikes -= 1;
          $scope.comments[index].disliked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.showComments = function(){
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    }
    postFactory.getSortedComments(sortingObject)
    .success(function(posts){
      if(currentUser){
        postFactory.formatLikedPosts(posts, currentUser);
        $scope.comments = posts;
      } else {
        $scope.comments = posts;
      }
    })
  }

  $scope.submitComment = function(comment, question){
    console.log(question);
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: question._id,
        postType: "comment",
        token: auth.getToken()
      }
      postFactory.createPost(commentObject)
      .success(function(post){
        $scope.comments.push(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };

  $scope.$emit("getNotifications")
});
