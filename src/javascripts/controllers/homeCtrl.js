'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  (function getPosts(){
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question"
    }
    postFactory.getTopStories(sorting)
    .success(function(posts){
      if(currentUser){
        postFactory.formatLikedPosts(posts, currentUser);
        $scope.posts = posts;
      } else {
        $scope.posts = posts;
      }
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
      uid: currentUser._id,
      type: "like"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = true;
      $scope.posts[index].likes += 1;
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.unlikePost = function(index){
    var statsObject = {
      pid: $scope.posts[index]._id,
      uid: currentUser._id,
      type: "dislike"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      $scope.posts[index].liked = false;
      $scope.posts[index].likes -= 1;
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    $scope.comments = $scope.posts[index].comments;
  }

  $scope.hideComments = function(index){
    $scope.posts[index].showComments = false;
  }

  $scope.submitComment = function(comment, post){
    var commentObject = {
      content: comment,
      author: currentUser._id,
      responseTo: post._id,
      postType: "comment"
    }
    postFactory.createPost(commentObject)
    .success(function(post){
      $scope.comments.unshift(post);
      console.log(post);
    })
    .error(function(err){
      console.log("error: ", err)
    })
  }

  postFactory.getPostsByTag();

});
