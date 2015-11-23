'use strict';


app.controller('profileCtrl', function($scope, $state, auth){

  $(document).foundation();
  $scope.$emit("getNotifications");
});
