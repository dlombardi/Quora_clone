'use strict';

var app = angular.module('quora');

app.controller('navCtrl', function($scope, $state, auth) {
  $scope.logout = function() {
    auth.logout();
    $state.go('home');
  };
});
