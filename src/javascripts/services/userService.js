'use strict';

app.factory('userFactory', function($window, $http){
  var userFactory= {};

  userFactory.addKnowledge = function(knowledgeObject) {
    return $http.post('/users/addKnowledge', knowledgeObject);
  };

  userFactory.updateInfo = function(updateObject){
    return $http.put('/users/updateInfo', updateObject);
  };

  userFactory.follow = function(followObject){
    return $http.post('/posts/follow', followObject);
  };

  userFactory.unfollow = function(unfollowObject){
    return $http.put('/posts/unfollow', unfollowObject);
  };

  userFactory.subscribe = function(subscribeOject){
    return $http.post('/posts/subscribe', subscribeObject);
  };

  userFactory.unsubscribe = function(unsubscribeObject){
    return $http.put('/posts/unsubscribe', unsubscribeObject);
  };

  return userFactory;
});
