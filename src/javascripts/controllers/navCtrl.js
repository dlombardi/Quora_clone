app.controller('navCtrl', function($scope, $state, auth){
  $scope.loggedIn = auth.isLoggedIn();

  $scope.logout = function(){
    auth.logout();
    $scope.loggedIn = false;
    $state.go('home');
  }
});
