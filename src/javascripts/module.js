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
