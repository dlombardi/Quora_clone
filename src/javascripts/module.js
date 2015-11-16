'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll']);

app.run(function($rootScope, auth) {
    $rootScope.getCurrentUser = auth.currentUser();
})

app.constant('tokenStorageKey', 'my-token');

app.config(function($stateProvider, $locationProvider, $urlRouterProvider){
  $stateProvider

    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('post', { url: '/post', templateUrl: '/html/general/post.html', controller: 'writeCtrl'})
    .state('thread', { url: '/thread', templateUrl: '/html/general/thread.html', controller: 'threadCtrl'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
});
