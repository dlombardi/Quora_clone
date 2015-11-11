'use strict';

var app = angular.module('quora', ['ui.router', 'stormpath', 'stormpath.templates']);

app.constant('tokenStorageKey', 'my-token');

app.config(function($stateProvider, $urlRouterProvider){
  $stateProvider
    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
});

app.run(function($stormpath){
  $stormpath.uiRouter({
    loginState: 'users.login',
    defaultPostLoginState: 'home'
  });
});

'use strict';

var app = angular.module('quora');

app.controller('homeCtrl', function($scope) {

});

app.controller('navCtrl', function($scope, $state) {
  $scope.logout = function() {
    $state.go('home');
  };
});

'use strict';

app.controller('profileCtrl', function($scope, $state){

});

'use strict';

app.controller('usersCtrl', function($scope, $state){
  $scope.Login = false;

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

});
