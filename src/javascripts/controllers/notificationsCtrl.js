'use strict';



app.controller('notificationsCtrl', function($scope, $http, auth, userFactory, postFactory, topicFactory){
  $scope.currentUser = auth.currentUser();
  $scope.newNotifications;
  $scope.oldNotifications;

  ($scope.getNotifications = function(){
    $scope.newNotifications = [];
    $scope.oldNotifications = [];
    var userObject = {
      uid: $scope.currentUser._id
    }
    userFactory.getNotifs(userObject)
    .success(function(user){
      $scope.newNotifications = user.notifications.filter(function(notif){
        return notif.seen;
      })
      $scope.oldNotifications = user.notifications.filter(function(notif){
        return !notif.seen;
      })
      userFactory.clearNotifs(userObject)
      .success(function(user){
        console.log("user: ", user);
      })
      .error(function(err){
        console.log("error: ", err);
      })
    })
    .error(function(err){
      console.log("error: ", err);
    })
  })();
});
