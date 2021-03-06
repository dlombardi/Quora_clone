'use strict';


app.controller('topicCtrl', function($scope, $state, $stateParams, topicFactory, auth, userFactory, postFactory, $rootScope) {
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $scope.posts;
  $scope.topic;
  $scope.subscribed = false;
  $(document).foundation();

  (function getTopicPosts(){
    topicFactory.getTopic($stateParams.topic)
    .success(function(topic){
      topic.subscribers.forEach(subscriber => {
        subscriber === currentUser._id ? $scope.subscribed = true : $scope.subscribed = false;
      });
      $scope.topic = topic;
      postFactory.formatPosts(topic.posts, currentUser);
      $scope.posts = topic.posts;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();

  $scope.subscribe = function(){
    var subscribeObject = {
      uid: currentUser._id,
      topic: $stateParams.topic
    }
    console.log(subscribeObject)
    userFactory.subscribe(subscribeObject)
    .success(function(data){
      $scope.subscribed = true;
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.unsubscribe = function(){
    var unsubscribeObject = {
      uid: currentUser._id,
      topic: $stateParams.topic
    }
    userFactory.unsubscribe(unsubscribeObject)
    .success(function(data){
      $scope.subscribed = false;
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.togglePostLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.posts[index].likes += 1
          $scope.posts[index].liked = true;
        } else {
          $scope.posts[index].likes -= 1;
          $scope.posts[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.togglePostDislike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(post => {
        if(action === "dislike"){
          $scope.posts[index].dislikes += 1
          $scope.posts[index].disliked = true;
        } else {
          $scope.posts[index].dislikes -= 1;
          $scope.posts[index].disliked = false;
        }
      })
      .error(err => {
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
  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id,
      postType: "comment"
    }
    postFactory.getSortedComments(sortingObject)
    .success(function(posts){
      postFactory.formatPosts(posts, currentUser);
      console.log(posts);
      $scope.comments = posts;
    })
  }

  $scope.hideComments = function(index){
    $scope.posts[index].showComments = false;
  }

  $scope.submitComment = function(comment, post){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: post._id,
        postType: "comment",
        token: auth.getToken()
      }
      postFactory.createPost(commentObject)
      .success(function(post){
        $scope.comments.push(post);
        console.log(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.$emit("notHome");
  $scope.$emit("getNotifications")

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

});
