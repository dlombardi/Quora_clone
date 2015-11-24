'use strict';



app.controller('composeCtrl', function($scope, $http, $location, $state, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];
  $scope.selectedTopic;
  $scope.toggleDropdown = false;


  (function init(){
    topicFactory.getTopics()
    .success(function(topics){
      $scope.topics = topics;
      console.log(topics);
    })
    .error(function(err){
      console.log("error: ", err)
    })
    var questionObject = {
      postType: "question"
    }
    postFactory.getSortedPosts(questionObject)
    .success(function(questions){
      $scope.topQuestion = questions[0];
    })
    .error(function(err){
      console.log("error: ", err);
    })
  })();



  $scope.addTopicToPost = function(topic){
    $scope.selectedTopic = topic.name;
    $scope.toggleDropdown = true;
    window.setTimeout(function(){
        $scope.toggleDropdown = false;
    }, 50);
  }

  $scope.submitQuestion = function(question, selectedTopic){
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
      $location.path('thread/'+data._id+'');
    })
    .error(function(err){
      console.log(err);
    })
  };

  $scope.submitTopic = function(topic){
    console.log("SUBMIT POST FUNCTION STARTS");
    var topicObject = {
      name: topic.name,
      about: topic.about,
      token: auth.getToken()
    }
    topicFactory.createTopic(topicObject)
    .success(function(topic){
      $scope.topics.push(topic);
       swal({
         title: "Success!",
         text: "You've made a new Topic!",
         timer: 750,
         showConfirmButton: false
       });
      $state.go("compose");
    })
    .error(function(err){
      swal({
        title: "Error!",
        text: "Missing fields!",
        showConfirmButton: true
      });
    })
  };

  $scope.$emit("notHome");
  $scope.$emit("getNotifications");
});
