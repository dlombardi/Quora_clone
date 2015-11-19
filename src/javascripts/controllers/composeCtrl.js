'use strict';



app.controller('composeCtrl', function($scope, $http, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];
  $scope.selectedTopic;
  $scope.toggleDropdown = false;


  (function populateTopics(){
    topicFactory.getTopics()
    .success(function(topics){
      $scope.topics = topics;
      console.log(topics);
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();

  $scope.addTopicToPost = function(topic){
    $scope.selectedTopic = topic.name;
    $scope.toggleDropdown = true;
    window.setTimeout(function(){
        $scope.toggleDropdown = false;
    }, 50);
  }

  $scope.checkTopic = function(){
    console.log("NG CHANGE");
    if (!$scope.topic) {
      console.log("EMPTY TOPICS");
    } else {
      console.log("NOT EMPTY");
    }
  }

  $scope.submitQuestion = function(question, selectedTopic){
    console.log("SUBMIT POST FUNCTION STARTS");
    var questionObject = {
      author: currentUser._id,
      title: question.title,
      tags: question.tags,
      content: question.content,
      topic: selectedTopic,
      postType: "question",
      token: auth.getToken()
    }
    console.log(questionObject);
    postFactory.createPost(questionObject)
    .success(function(data){
      console.log("success: ", data);
    })
    .error(function(err){
      console.log(err);
    })
  };
});
