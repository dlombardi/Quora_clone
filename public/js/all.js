'use strict';

var app = angular.module('quora', ['ui.router']);

app.constant('tokenStorageKey', 'my-token');

app.config(function($stateProvider, $locationProvider, $urlRouterProvider){
  $stateProvider

    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('post', { url: '/post', templateUrl: '/html/general/post.html', controller: 'postCtrl'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
});

'use strict';

app.factory('auth', function($window, $http, tokenStorageKey) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage[tokenStorageKey] = token;
  };

  auth.getToken = function() {
    return $window.localStorage[tokenStorageKey];
  };

  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.username;
    }
  };

  auth.register = function(user){
    return $http.post('/users/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.login = function(user){
    return $http.post('/users/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logout = function(){
    $window.localStorage.removeItem(tokenStorageKey);
  };

  return auth;
});

'use strict';


app.controller('homeCtrl', function($scope, $state) {

});

'use strict';


app.controller('postCtrl', function($scope, $state){
  console.log("POST CTRL WORKING");

});

'use strict';


app.controller('profileCtrl', function($scope, $state){
  console.log("PROFILE CTRL WORKING");
});

'use strict';


app.controller('threadCtrl', function($scope, $state){
  console.log("THREAD CTRL WORKING");

});

'use strict';



app.controller('usersCtrl', function($scope, $state, auth){
  $scope.Login = false;
  $scope.LoggedIn = true;
  
  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.LoggedIn = false;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(res){
      $scope.LoggedIn = true;
      $state.go('home');
    }).error(function(res){
      $scope.user = {};
      alert(res.message);
    });
  };

  $scope.logout = function(){
    auth.logout();
    $scope.LoggedIn = false;
  }
});
