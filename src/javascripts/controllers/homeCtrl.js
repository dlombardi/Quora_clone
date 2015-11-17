'use strict';


app.controller('homeCtrl', function($scope, $state, $rootScope, postFactory, topicFactory, auth) {
  var currentUser = $rootScope.getCurrentUser;
  $scope.posts;
  $scope.topicFeed;

  (function getPosts(){
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
  })();

  $scope.likePost = function(index){
    var statsObject = {
      pid: $scope.posts[index]._id,
      type: "like"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = true;
      $scope.posts[index].likes += 1;
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }

  $scope.unlikePost = function(index){
    console.log("in unlike");
    var statsObject = {
      pid: $scope.posts[index]._id,
      type: "dislike"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = false;
      $scope.posts[index].likes -= 1;
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }

});
