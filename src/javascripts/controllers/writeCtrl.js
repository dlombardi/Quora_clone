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
    posts.push({
      title: question.title,
      tags: question.tags,
      details: question.content,
      topic: question.topic
    });
    $scope.question = {};
    console.log(posts);

    $http({
      method: 'POST',
      url: '/posts/add'
    }).then(function(data){
      console.log(data);
    }).catch(function(err){
      console.error("Error saving question.");
    });
  }
});
