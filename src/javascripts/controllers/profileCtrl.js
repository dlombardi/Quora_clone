'use strict';


app.controller('profileCtrl', function($scope, $stateParams, $state, auth, userFactory, postFactory){
  $(document).foundation();
  $scope.currentUser = false;
  $scope.followed = false;
  let currentUser = auth.currentUser();
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

  $scope.$emit("getNotifications");
  $scope.$emit("notHome");
});
