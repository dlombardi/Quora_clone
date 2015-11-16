'use strict';

app.controller('threadCtrl', function($scope, $state, postFactory){
  console.log("THREAD CTRL WORKING");
  $scope.displayComments = false;
  $scope.displayAnswerForm = false;


  $scope.showComments = function(){
    $scope.displayComments = !$scope.displayComments;
  }

  $scope.showAnswerForm = function(){
    $scope.displayAnswerForm = !$scope.displayAnswerForm;
  }


  $scope.comments = [{author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god", likes: 19}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god", views: 19}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}];

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };
});
