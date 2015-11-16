app.controller('navCtrl', function($scope, $state, auth, $rootScope){
  var currentUser = $rootScope.getCurrentUser;
  var loggedIn = $rootScope.loggedIn;

  $scope.logout = function(){
    auth.logout();
    $rootScope.loggedIn = false;
    $state.go('home');
  }
});
