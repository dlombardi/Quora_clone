'use strict';


app.controller('homeCtrl', function($scope, $state, $rootScope, postFactory, topicFactory, auth) {
  var currentUser = $rootScope.getCurrentUser;
  $scope.posts;
  $scope.topicFeed;

  function getPosts(){
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question"
    }
    postFactory.getTopStories(sorting)
    .success(function(posts){
      $scope.posts = posts;
    })
    .error(function(err){
      console.log("error: ", err)
    });

    topicFactory.get7Topics()
    .success(function(topics){
      $scope.topicFeed = topics;
      console.log(topics);
    })
    .error(function(err){
      console.log("error: ", err)
    })
  }
  getPosts();

  $scope.likePost = function(post){
    var statsObject = {
      pid: post._id,
      type: "like"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = true;
      getPosts();
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }

  $scope.unlike = function(post){
    var statsObject = {
      pid: post._id,
      type: "dislike"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = false;
      getPosts();
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }

});
