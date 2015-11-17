'use strict';



app.controller('writeCtrl', function($scope, $http, $rootScope, postFactory){
  var currentUser = $rootScope.getCurrentUser;
  $(document).foundation();

  $scope.submitQuestion = function(question){
    console.log("SUBMIT POST FUNCTION STARTS");
    $scope.question = {
      pid: $scope.posts[index]._id,
      uid: currentUser._id,
      title: title,
      tags: tags,
      content: content,
      topic: topic
    }
  };
});
