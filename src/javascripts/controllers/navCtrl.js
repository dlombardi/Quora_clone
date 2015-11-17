app.controller('navCtrl', function($scope, $state, auth, postFactory){
  $scope.loggedIn = auth.isLoggedIn();

  $scope.logout = function(){
    auth.logout();
    $scope.loggedIn = false;
    $state.go('home');
  }

});
