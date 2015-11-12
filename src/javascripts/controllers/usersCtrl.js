'use strict';



app.controller('usersCtrl', function($scope, $state, auth){
  $scope.Login = false;

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(res){
      $state.go('home');
    }).error(function(res){
      $scope.user = {};
      alert(res.message);
    });
  };
});
