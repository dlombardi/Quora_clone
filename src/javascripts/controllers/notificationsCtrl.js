'use strict';



app.controller('notificationsCtrl', function($scope, $http, auth, userFactory, postFactory, topicFactory){
  $scope.currentUser = auth.currentUser();
  $scope.notifications;

  ($scope.getNotifications = function(){
    userFactory.getUser($scope.currentUser._id)
    .success(function(user){
      $scope.notifications = user.notifications;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();
});
