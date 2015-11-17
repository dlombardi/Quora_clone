'use strict';

app.controller('usersCtrl', function($scope, $state, auth, userFactory){
  $scope.Login = false;
  $scope.loggedIn = auth.isLoggedIn();

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(data){
      console.log(data);
      $scope.loggedIn = true;
      $state.go('home');
    }).error(function(err){
      console.log(err);
      $scope.user = {};
      alert(err);
    });
  };

  $scope.logout = function(){
    auth.logout();
    $scope.loggedIn = false;
    $state.go('home');
  }

  $scope.filterByTag = function(tag){
    postFactory.getPostsByTag(tag);
  }
});
