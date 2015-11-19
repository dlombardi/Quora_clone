'use strict';

app.controller('usersCtrl', function($scope, $state, auth, userFactory, postFactory, $rootScope){
  $scope.Login = false;
  $scope.loggedIn = auth.isLoggedIn();

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    submitFunc(user).success(function(data){
      $scope.$emit('login');
      $state.go('home');
    }).error(function(err){
      swal({
        title: "Input Not Valid",
        text: "Either the username or password was entered incorrectly",
        timer: 2000,
        type: "error",
        confirmButtonColor: "#B92B27"
      });
      $scope.user = {};
    });
  };

  $scope.logout = function(){
    auth.logout();
    $scope.$emit('logout');
    $state.go('home');
  }

  $scope.filterByTag = function(tag){
    postFactory.getPostsByTag(tag)
    .success(function(posts){
      $scope.$emit('tag posts', posts);
    })
    .error(function(err){
      console.log(err);
    })
  }

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })
});
