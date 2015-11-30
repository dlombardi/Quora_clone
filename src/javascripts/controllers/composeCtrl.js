'use strict';



app.controller('composeCtrl', function($scope, $http, $location, $state, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];
  $scope.selectedTopic;
  $scope.toggleDropdown = false;


  (function init(){
    topicFactory.getTopics()
    .success(topics => {
      $scope.topics = topics;
    })
    .error(err => {
      console.log("error: ", err)
    })
    var questionObject = {
      postType: "question"
    }
    postFactory.getSortedPosts(questionObject)
    .success(questions => {
      $scope.topQuestion = questions[0];
    })
  })();



  $scope.addTopicToPost = (topic) => {
    $scope.selectedTopic = topic.name;
    $scope.toggleDropdown = true;
    window.setTimeout(function(){
        $scope.toggleDropdown = false;
    }, 50);
  }

  $scope.submitQuestion = (isValid, question, selectedTopic) => {
    if(isValid){
      var questionObject = {
        author: currentUser._id,
        title: question.title,
        tags: question.tags,
        content: question.content,
        topic: selectedTopic,
        postType: "question",
        token: auth.getToken()
      }
      postFactory.createPost(questionObject)
      .success(data => {
        $location.path('thread/'+data._id+'');
      })
      .error(err => {
        console.log(err);
      })
    } else {
      swal({
        title: "Invalid Form",
        text: "Incorrect Inputs",
        timer: 2000,
        type: "error",
        confirmButtonColor: "#B92B27"
      });
    }
  };

  $scope.submitTopic = (topic) => {
    console.log("SUBMIT POST FUNCTION STARTS");
    var topicObject = {
      name: topic.name,
      about: topic.about,
      token: auth.getToken()
    }
    topicFactory.createTopic(topicObject)
    .success(topic => {
      $scope.topics.push(topic);
       swal({
         title: "Success!",
         text: "You've made a new Topic!",
         timer: 750,
         showConfirmButton: false
       });
      $state.go("compose");
    })
    .error(err => {
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
