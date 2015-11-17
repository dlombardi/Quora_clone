'use strict';

app.factory('postFactory', function($window, $http){
  var postFactory= {};

  postFactory.createPost = function(postInput) {
    return $http.post('/posts/add', newPost);
  };

  postFactory.deletePost = function(pid){
    return $http.delete('/posts/delete', pid);
  };

  postFactory.changeStats = function(statObject){
    return $http.put('/posts/changeStats', statObject);
  };

  postFactory.editPost = function(editObject){
    return $http.put('/posts/edit', editObject);
  };

  postFactory.getTopStories = function(sorting){
    return $http.get('/posts/sorted/user/topic/tag/postType/'+ sorting.postType +'');
  };

  return postFactory;
});



// $http({
//   method: 'GET',
//   url: '/topics'
// }).then(function(data){
//   var specialdata = [{myButt: 'data'}, {myButt: 'butt'}, {myButt: 'rocks'}, {myButt: 'salt'}, {myButt: 'bathsalt'}];
//   $scope.topics = specialdata;
// }).catch(function(err){
//   console.error('errthang is wrong.', err, status);
// });
