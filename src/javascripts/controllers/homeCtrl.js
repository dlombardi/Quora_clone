'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  $scope.getPosts = function(sortingMethod){
    console.log("IN GET POSTS");
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question",
      sortingMethod: sortingMethod
    }
    postFactory.getSortedPosts(sorting)
    .success(function(posts){
      if($scope.loggedIn){
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
      console.log(topics);
      $scope.topicFeed = topics;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  };

  $scope.getPosts("likes");

  $scope.sortLikes = function(){
    $(".filter").removeClass("active");
    $("#likes").addClass("active");
    $scope.getPosts("likes");
  }

  $scope.sortViews = function(){
    $(".filter").removeClass("active");
    $("#views").addClass("active");
    $scope.getPosts("views");
  }

  $scope.sortOldest = function(){
    $(".filter").removeClass("active");
    $("#oldest").addClass("active");
    $scope.getPosts("oldest");
  }

  $scope.sortNewest = function(){
    $(".filter").removeClass("active");
    $("#newest").addClass("active");
    $scope.getPosts("newest");
  }

  $scope.togglePostLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "dislike" : action = "like";
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

  $scope.toggleCommentLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "dislike" : action = "like";
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

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
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

  $scope.$on('filteredByTags', function(event, posts){
    postFactory.formatLikedPosts(posts, currentUser);
    $scope.posts = posts;
  })

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.getPosts();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  postFactory.getPostsByTag();

});
