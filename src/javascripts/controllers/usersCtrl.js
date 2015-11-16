'use strict';



app.controller('usersCtrl', function($scope, $state, auth, userFactory, $rootScope){
  $scope.Login = false;
  $scope.LoggedIn = true;
  var currentUser = $rootScope.getCurrentUser;

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.LoggedIn = false;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(data){
      $scope.LoggedIn = true;
      $state.go('home');
    }).error(function(err){
      $scope.user = {};
      alert(err.message);
    });
  };

  $scope.logout = function(){
    auth.logout();
    $scope.LoggedIn = false;
  }
});
