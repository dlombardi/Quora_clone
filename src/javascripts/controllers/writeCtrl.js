'use strict';



app.controller('writeCtrl', function($scope, $http){
  var posts = [];
  $(document).foundation();

  $http({
    method: 'GET',
    url: '/topics'
  }).then(function(data){
    var specialdata = [{myButt: 'data'}, {myButt: 'butt'}, {myButt: 'rocks'}, {myButt: 'salt'}, {myButt: 'bathsalt'}];
    console.log('data is: ', data);
    $scope.topics = specialdata;
  }).catch(function(err){
    console.error('errthang is wrong.', err, status);
  });


  $scope.submitQuestion = function(question){
    $http({
      method: 'POST',
      url: '/posts/add'
    }).then(function(data){
      $scope.question = {
        title: title,
        tags: tags,
        content: content,
        topic: topic
      }
      $scope.question = {}
    })
    .catch(function(err){
      console.error("Error saving question.");
    });
  }
});
