'use strict';


app.controller('profileCtrl', function($scope, $stateParams, $state, auth, userFactory){
  $(document).foundation();
  $scope.currentUser = false;
  $scope.followed = false;
  userFactory.getUser($stateParams.user)
  .success(user => {
    if(user._id === auth.currentUser()._id){
      $scope.currentUser = true;
    }
    user.followers.indexOf(auth.currentUser()._id) !== -1 ? $scope.followed = true : $scope.followed = false;
    $scope.user = user;
  })

  $scope.$emit("getNotifications");
  $scope.$emit("notHome");
});
