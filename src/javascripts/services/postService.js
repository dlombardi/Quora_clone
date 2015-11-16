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

  postFactory.getSorted = function(sortedObject){
    return $http.get('/posts/sorted/' + sortedObject.tid + '/' + sortedObject.sortingMethod + '/' + sortedObject.tag);
  };

  return postFactory;
});
