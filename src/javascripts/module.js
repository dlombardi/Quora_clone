'use strict';

var app = angular.module('quora', ['ui.router']);

app.constant('tokenStorageKey', 'my-token');

app.config(function($stateProvider, $locationProvider, $urlRouterProvider){
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });

  $stateProvider
    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
});
