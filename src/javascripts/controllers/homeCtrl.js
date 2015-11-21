'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  $scope.getPosts = function(sortingMethod){
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

  $scope.sortDislikes = function(){
    $(".filter").removeClass("active");
    $("#dislikes").addClass("active");
    $scope.getPosts("dislikes");
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
      .success(function(post){
        if(action === "dislike"){
          $scope.posts[index].dislikes += 1
          $scope.posts[index].disliked = true;
        } else {
          $scope.posts[index].dislikes -= 1;
          $scope.posts[index].disliked = false;
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
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.$emit("getNotifications")

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
