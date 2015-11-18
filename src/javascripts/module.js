'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll', 'hc.marked']);

app.constant('tokenStorageKey', 'my-token');

app.filter('unsafe', function($sce){
  return function(val){
    return $sce.trustAsHtml(val);
  }
})

.run(function($rootScope) {
    $rootScope.$on("logout", function(){
      $rootScope.$broadcast("loggedOut");
    })
    $rootScope.$on('login', function(){
      $rootScope.$broadcast("loggedIn");
    })
})

app.config(["$stateProvider", "$locationProvider", "$urlRouterProvider", "markedProvider", function($stateProvider, $locationProvider, $urlRouterProvider, markedProvider){
  $locationProvider.html5Mode(true).hashPrefix('!');;
  markedProvider.setOptions({
    gfm: true,
    tables: true,
    highlight: function (code, lang) {
      if (lang) {
        return hljs.highlight(lang, code, true).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    }
  });

  $stateProvider
    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('post', { url: '/post', templateUrl: '/html/general/write.html', controller: 'writeCtrl'})
    .state('thread', { url: '/thread', templateUrl: '/html/general/thread.html', controller: 'threadCtrl'})
    .state('topic', { url: '/topics/:topic?', templateUrl: '/html/general/topic.html', controller: 'topicCtrl'})
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
}]);
