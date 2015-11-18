'use strict';



app.controller('writeCtrl', function($scope, $http, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];



  (function populateTopics(){
    console.log("Populate topics function starts");
    $scope.topics = ["john", "wayne", "Gacy", "adam", "Darius", "Gary", "Dude", "Wilson", "Joe", "alex"];
    // $scope.topics = [];
    // topicFactory.getTopics()
    // .success(function(topics){
    //   $scope.topics = topics;
    //   console.log(topics);
    // })
    // .error(function(err){
    //   console.log("error: ", err)
    // })
  })();

  $scope.checkTopic = function(){
    console.log("NG CHANGE");
    if (!$scope.topic) {
      console.log("EMPTY TOPICS");
    } else {
      console.log("NOT EMPTY");
    }
  }

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
    postFactory.createPost(questionObject);
  };
});
