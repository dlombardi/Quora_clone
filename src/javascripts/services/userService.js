'use strict';

app.factory('userFactory', function($window, $http){
  var userFactory= {};

  userFactory.addKnowledge = function(knowledgeObject) {
    return $http.post('/api/users/addKnowledge', knowledgeObject);
  };

  userFactory.updateInfo = function(updateObject){
    return $http.put('/api/users/updateInfo', updateObject);
  };

  userFactory.follow = function(followObject){
    return $http.post('/api/users/follow', followObject);
  };

  userFactory.unfollow = function(unfollowObject){
    return $http.put('/api/users/unfollow', unfollowObject);
  };

  userFactory.subscribe = function(subscribeOject){
    return $http.post('/api/users/subscribe', subscribeObject);
  };

  userFactory.unsubscribe = function(unsubscribeObject){
    return $http.put('/api/users/unsubscribe', unsubscribeObject);
  };

  return userFactory;
});
