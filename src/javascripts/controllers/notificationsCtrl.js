'use strict';



app.controller('notificationsCtrl', function($scope, $http, auth, userFactory, postFactory, topicFactory){
  $scope.currentUser = auth.currentUser();
  $scope.notifications;

  ($scope.clearNotifications = function(){
    var userObject = {
      uid: $scope.currentUser._id
    }
    userFactory.clearNotifs(userObject)
    .success(function(user){
      $scope.notifications = user.notifications;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();
});
