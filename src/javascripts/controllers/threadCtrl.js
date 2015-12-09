'use strict';

app.controller('threadCtrl', function($scope, $state, auth, postFactory, $rootScope, $stateParams){
  $scope.displayAnswerForm = false;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $(document).foundation();

  $scope.answers;
  $scope.comments;
  $scope.question;

  ($scope.getPost = function(){
    postFactory.getPost($stateParams.thread)
    .success(function(question){
      $scope.question = question;
      $scope.topic = question.topic;
      $scope.comments = question.comments;
      var sortingObject = {
        sortingMethod: "likes",
        pid: question._id
      }
      postFactory.getSortedAnswers(sortingObject)
      .success(answers => {
        $scope.answers = answers
      })
    })
    .error(function(err){
      console.log(err);
    });
  })();

  $scope.submitAnswer = function(answer, question){
    var answerObject = {
      content: answer,
      author: currentUser._id,
      responseTo: question._id,
      postType: "answer",
      token: auth.getToken()
    }
    postFactory.createPost(answerObject)
    .success(function(answer){
      $scope.answers.push(answer);
      console.log(answer);
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.togglePostLike = (postSpecies, index) => {
    let postType;
    let action;
    postSpecies === "answer" ? postType = $scope.answers : postType = $scope.comments
    postType[index].liked ? action = "unlike" : action = "like";
    let statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    }
    postFactory.changeStats(statsObject)
    .success(post => {
      if(action === "like"){
        postType[index].likes += 1
        postType[index].liked = true;
      } else {
        postType[index].likes -= 1;
        postType[index].liked = false;
      }
    })
  }

  $scope.togglePostDislike = (postSpecies, index) => {
    let postType;
    let action;
    postSpecies === "answer" ? postType = $scope.answers : postType = $scope.comments
    postType[index].disliked ? action = "undo" : action = "dislike";
    let statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    }
    postFactory.changeStats(statsObject)
    .success(post => {
      if(action === "dislike"){
        postType[index].dislikes += 1
        postType[index].disliked = true;
      } else {
        postType[index].dislikes -= 1;
        postType[index].disliked = false;
      }
    })
  }

  $scope.showComments = function(){
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id,
      postType: "comment"
    }
    postFactory.getSortedComments(sortingObject)
    .success(comments => {
      console.log(comments);
      if(currentUser){
        postFactory.formatPosts(comments, currentUser)
        $scope.comments = comments;
      } else {
        $scope.comments = comments;
      }
    })
  }

  $scope.deletePost = (post, $index) => {
    postFactory.deletePost(post._id)
    .success(post => {
      switch (post.postType){
        case "comment":
          $scope.comments.splice($index, 1);
          break;
        case "question":
          $scope.posts.splice($index, 1);
          break;
      }
    })
    .error(err => {
      console.log("failed at deletePost function ");
      console.error(err);
    })
  }

  $scope.submitComment = function(comment, question){
    console.log(question);
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: question._id,
        postType: "comment",
        token: auth.getToken()
      }
      postFactory.createPost(commentObject)
      .success(function(post){
        $scope.comments.push(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };

  $scope.$emit("notHome");
  $scope.$emit("getNotifications")
});
