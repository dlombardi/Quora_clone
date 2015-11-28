'use strict';

app.controller('usersCtrl', function($scope, $state, auth, userFactory, postFactory, $rootScope, Upload, $timeout){
  $scope.Login = false;
  $scope.tagFilter = true;
  $scope.loggedIn = auth.isLoggedIn();
  $scope.currentUser = auth.currentUser();
  $scope.newNotifications = [];

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.login = function(username, password) {
    var user = {
      username: username,
      password: password
    }
    auth.login(user).success(function(data){
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
    });
  };


  $scope.register = function(file) {
     file.upload = Upload.upload({
       url: 'auth/register',
       data: {
         file: file,
         username: $scope.username,
         email: $scope.email,
         fullName: $scope.fullName,
         password: $scope.password
       },
     });
     file.upload.then(function (response) {
       auth.saveToken(response.data.token);
       $scope.$emit('login');

       $timeout(function () {
         file.result = response.data;
         $state.go('home');
       });
     }, function (response) {
       if (response.status > 0)
         $scope.errorMsg = response.status + ': ' + response.data;
     }, function (evt) {
       // Math.min is to fix IE which reports 200% sometimes
       file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
     });
   }

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
      console.log("error: ", err);
    })
  }

  $scope.$on("removeTagFilter", function(){
    $scope.tagFilter = false;
  })

  $scope.$on("addTagFilter", function(){
    $scope.tagFilter = true;
  })

  $scope.$on("notifications", function(){
    userFactory.getUser($scope.currentUser._id)
    .success(function(user){
      $scope.picture = auth.loggedInUser.picture;
      $scope.newNotifications = user.notifications.filter(function(notif){
        return !notif.seen;
      })
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.notifications = [];
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.currentUser = auth.currentUser();
    userFactory.getUser($scope.currentUser._id)
    .success(function(user){
      $scope.picture = auth.loggedInUser.picture;
      $scope.newNotifications = user.notifications.filter(function(notif){
        return !notif.seen;
      })
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })

});
