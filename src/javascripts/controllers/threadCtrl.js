'use strict';

app.controller('threadCtrl', function($scope, $state, postFactory){
  console.log("THREAD CTRL WORKING");

  $scope.comments = ['test comment 1','test comment 2','test comment 3','test comment 4','test comment 5','test comment 6','test comment 7','test comment 8'];

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };
});
