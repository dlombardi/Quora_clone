'use strict';


app.controller('navCtrl', function($scope, $state, auth) {
  $scope.logout = function() {
    auth.logout();
    $state.go('home');
  };
});
