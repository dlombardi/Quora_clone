'use strict';



app.controller('writeCtrl', function($scope, $http, auth, postFactory){
  var currentUser = auth.getCurrentUser;
  $(document).foundation();

  $scope.submitQuestion = function(question, currentUser){
    console.log("SUBMIT POST FUNCTION STARTS");
    var questionObject = {
      author: currentUser._id,
      title: question.title,
      tags: question.tags,
      content: question.content,
      topic: question.topic,
      postType: "question"
    }
  };
});
