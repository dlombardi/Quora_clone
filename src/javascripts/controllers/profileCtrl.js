'use strict';


app.controller('profileCtrl', function($scope, $log, $stateParams, $state, auth, userFactory, postFactory){
  $(document).foundation();
  $scope.currentUser = false;
  $scope.followed = false;
  let currentUser = auth.currentUser();
  $scope.posts;



  userFactory.getUser($stateParams.user)
  .success(user => {
    if(user._id === auth.currentUser()._id){
      $scope.currentUser = true;
    }
    user.followers.indexOf(currentUser._id) !== -1 ? $scope.followed = true : $scope.followed = false;
    $scope.user = user;
  })

  $scope.togglePostLike = (postSpecies, index) => {
    let postType;
    let action;
    postSpecies === "post" ? postType = $scope.user.posts : postType = $scope.comments
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
    postSpecies === "post" ? postType = $scope.user.posts : postType = $scope.comments
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

  $scope.showComments = (index) => {
    $scope.user.posts[index].showComments = true;
    let comments = $scope.user.posts[index].comments;
    let sortingObject = {
      sortingMethod: "likes",
      pid: $scope.user.posts[index]._id,
      postType: "comment"
    }
    postFactory.getSortedComments(sortingObject)
    .success(posts => {
      $scope.comments = posts;
    })
  }

  $scope.hideComments = (index) => {
    $scope.user.posts[index].showComments = false;
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
    .success(post => {
      $scope.comments.push(post);
    })
    .error(err => {
      $log.warning("failed to submit comment");
      $log.error(err);
    })
  }

  $scope.deletePost = (post, $index) => {
    postFactory.deletePost(post._id)
    .success(post => {
      switch (post.postType){
        case "comment":
          $scope.user.comments.splice($index, 1);
          break;
        case "question":
          $scope.user.posts.splice($index, 1);
          break;
      }
    })
    .error(err => {
      $log.warning("failed at deletePost function ");
      $log.error(err);
    })
  }

  $scope.updateInfo = (info) => {
    userFactory.updateInfo(info)
    .then(user => {
      $scope.user = user.data;
    });
  }


  $scope.$emit("getNotifications");
  $scope.$emit("notHome");
});
