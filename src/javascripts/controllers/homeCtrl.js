'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth, marked, $sce) {
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
    postFactory.getSortedPosts(sorting)
    .success(function(posts){
      if(currentUser){
        postFactory.formatLikedPosts(posts, currentUser);
        console.log("posts: ", posts);
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

  $scope.togglePostLike = function(index){
    var action;
    $scope.posts[index].liked ? action = "dislike" : action = "like";
    var statsObject = {
      pid: $scope.posts[index]._id,
      uid: currentUser._id,
      type: action
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

  $scope.toggleCommentLike = function(index){
    var action;
    $scope.comments[index].liked ? action = "dislike" : action = "like";
    var statsObject = {
      pid: $scope.comments[index]._id,
      uid: currentUser._id,
      type: action
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

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    }
    postFactory.getSortedComments(sortingObject)
    .success(function(posts){
      postFactory.formatLikedPosts(posts, currentUser);
      console.log(posts);
      $scope.comments = posts;
    })
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
      $scope.comments.push(post);
      console.log(post);
    })
    .error(function(err){
      console.log("error: ", err)
    })
  }

  postFactory.getPostsByTag();

});
