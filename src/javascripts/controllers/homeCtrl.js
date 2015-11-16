'use strict';


app.controller('homeCtrl', function($scope, $state, $rootScope, postFactory, auth) {
  var currentUser = $rootScope.getCurrentUser;
  $scope.posts;

  (function getPosts(){
    $scope.posts = [];
    var sorting = {
      sortingMethod: "views"
    }
    postFactory.getTopStories(sorting)
    .success(function(posts){
      $scope.posts = posts;
      console.log(posts);
    })
    .error(function(err){
      console.log(err);
    })
  })();

});
