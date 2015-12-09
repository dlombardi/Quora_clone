'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, userFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.topicFeed;
  let currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $(document).foundation();

  if(!$scope.loggedIn){
    $state.go("users.login");
  }

  $scope.getPosts = (sortingMethod) => {
    $scope.posts = [];
    $scope.topicFeed = [];
    let sorting = {
      postType: "question",
      sortingMethod: sortingMethod
    }
    postFactory.getSortedPosts(sorting)
    .success(posts => {
      $scope.posts = posts;
    })
    topicFactory.get7Topics()
    .success(posts => {
      $scope.topicFeed = posts;
    })
    userFactory.getUser(currentUser._id)
    .success(user => {
      $scope.subscriptions = user.subscriptions;
    })
  };

  $scope.getPosts("likes");

  $scope.sortLikes = () => {
    $(".filter").removeClass("active");
    $("#likes").addClass("active");
    $scope.getPosts("likes");
  }

  $scope.sortDislikes = () => {
    $(".filter").removeClass("active");
    $("#dislikes").addClass("active");
    $scope.getPosts("dislikes");
  }

  $scope.sortOldest = () => {
    $(".filter").removeClass("active");
    $("#oldest").addClass("active");
    $scope.getPosts("oldest");
  }

  $scope.sortNewest = () => {
    $(".filter").removeClass("active");
    $("#newest").addClass("active");
    $scope.getPosts("newest");
  }

  $scope.sortSubscriptions = () => {
    $(".filter").removeClass("active");
    $("#subscriptions").addClass("active");
    postFactory.subscriptionsPosts(currentUser._id)
    .success(posts => {
      $scope.posts = posts;
    })
  }

  $scope.togglePostLike = (postSpecies, index) => {
    let postType;
    let action;
    postSpecies === "post" ? postType = $scope.posts : postType = $scope.comments
    postType[index].liked ? action = "unlike" : action = "like";
    let statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    }
    postFactory.changeStats(statsObject)
    .success(post => {
      if(action === "like"){
        postType[index].likes += 1
        postType[index].liked = true;
      } else {
        postType[index].likes -= 1;
        postType[index].liked = false;
      }
    })
  }

  $scope.togglePostDislike = (postSpecies, index) => {
    let postType;
    let action;
    postSpecies === "post" ? postType = $scope.posts : postType = $scope.comments
    postType[index].disliked ? action = "undo" : action = "dislike";
    let statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    }
    postFactory.changeStats(statsObject)
    .success(post => {
      if(action === "dislike"){
        postType[index].dislikes += 1
        postType[index].disliked = true;
      } else {
        postType[index].dislikes -= 1;
        postType[index].disliked = false;
      }
    })
  }

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    let comments = $scope.posts[index].comments;
    let sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id,
      postType: "comment"
    }
    postFactory.getSortedComments(sortingObject)
    .success(comments => {
      $scope.comments = comments;
    })
  }

  $scope.hideComments = (index) => {
    $scope.posts[index].showComments = false;
  }

  $scope.submitComment = (comment, post) => {
    var commentObject = {
      content: comment,
      author: currentUser._id,
      responseTo: post._id,
      postType: "comment",
      token: auth.getToken()
    }
    postFactory.createPost(commentObject)
    .success(comment => {
      $scope.comments.push(comment);
    })
    .error(err => {
      console.log("failed to submit comment");
      console.error(err);
    })
  }

  $scope.deletePost = (post, $index) => {
    postFactory.deletePost(post._id)
    .success(post => {
      switch (post.postType){
        case "comment":
          $scope.comments.splice($index, 1);
          break;
        case "question":
          $scope.posts.splice($index, 1);
          break;
      }
    })
    .error(err => {
      console.log("failed at deletePost function ");
      console.error(err);
    })
  }

  $scope.$emit("getNotifications");

  $scope.$emit("inHome");

  $scope.$on('filteredByTags', function(event, posts){
    $scope.posts = posts;
  })
  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.getPosts();
  })
  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

});
