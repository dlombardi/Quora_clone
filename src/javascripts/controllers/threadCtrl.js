'use strict';

app.controller('threadCtrl', function($scope, $state, postFactory, $rootScope, $stateParams){
  $scope.displayComments = false;
  $scope.displayAnswerForm = false;
  var currentUser = $rootScope.getCurrentUser;

  ($scope.getPost = function(){
    var postObject = {
      pid: $stateParams.thread
    }
    postFactory.getPost(postObject)
    .success(function(question){
      $scope.question = question;
      $scope.topic = question.topic;
    })
    .error(function(err){
      console.log(err);
    });
  })();


  $scope.showComments = function(){
    $scope.displayComments = !$scope.displayComments;
  }

  $scope.showAnswerForm = function(){
    $scope.displayAnswerForm = !$scope.displayAnswerForm;
  }

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };
});
