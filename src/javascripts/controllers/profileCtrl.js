'use strict';


app.controller('profileCtrl', function($scope, $state, auth, userFactory){
  $(document).foundation();
  var currentUser = auth.currentUser();
  console.log("PROFILE CTRL WORKING");

if (currentUser) {
      console.log(currentUser);
  } else {
    console.log('no one is logged in: ', currentUser);
  }

  $scope.user = {
    username:  "bananaLeaf31",
    fullName: "Firstname Lastname",
    email: String,
    home: 'Boise, Idaho',
    work: String,
    about: "I'm a Idaho transplant. I like protein power, casein powder, and the powder of any prototypes. The more powder, the better. You are what you eat and I am powder. I put the POW in powder. I also put the OW in powder. I also eat flax seeds for fiber content.",
    subscriptions: ['cars', 'cats', 'ferrets'],
    knowledge: ['bowling', 'Abyssian cats', 'rock collecting', 'muppets', 'protein'],
    followers: 34,
    following: 79,
    posts: [],
    postLikes: [],
    likes: 0,
    views: 0,
    hash: String,
  }

  $scope.follow = function(follow, currentUser) {
    console.log("follow clicked.");
    var followObject = {
      toFollow: follow,
      currentUser: currentUser
    }
    userFactory.follow(followObject);
  };

  $scope.unfollow = function() {
    console.log("unfollow");
    var unfollowObject = {
      toUnfollow: unfollow,
      currentUser: currentUser
    }
    userFactory.unfollow(unfollowObject);
  };

  $scope.subscribe = function(subscribeObject){
    console.log("subscribe triggered.");
    var subscribeObject = {
      subscribe: subscribe,
      currentUser: currentUser
    }
    userFactory.subscribe(subscribeObject);
  }


// EXAMPLE
  // $scope.submitQuestion = function(question, currentUser){
  //   console.log("SUBMIT POST FUNCTION STARTS");
  //   var questionObject = {
  //     author: currentUser._id,
  //     title: question.title,
  //     tags: question.tags,
  //     content: question.content,
  //     topic: question.topic,
  //     postType: "question"
  //   }
  //   postFactory.createPost(questionObject);
  // };

});
