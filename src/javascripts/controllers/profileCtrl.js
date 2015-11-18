'use strict';


app.controller('profileCtrl', function($scope, $state, auth){
  console.log("PROFILE CTRL WORKING");

  $scope.user = {
    username:  "bananaLeaf31",
    fullName: "Firstname Lastname",
    email: String,
    home: 'Boise, Idaho',
    work: String,
    about: "I'm a Idaho transplant. I like protein power, casein powder, and the powder of any prototypes. The more powder, the better. You are what you eat and I am powder. I put the POW in powder. I also put the OW in powder. I also eat flax seeds for fiber content.",
    subscriptions: ['cars', 'cats', 'ferrets'],
    knowledge: [],
    followers: 34,
    following: 79,
    posts: [],
    postLikes: [],
    likes: 0,
    views: 0,
    hash: String,
  }
});
