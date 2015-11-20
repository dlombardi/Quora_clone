'use strict';

app.factory('userFactory', function($window, $http){
  var userFactory= {};

  userFactory.getUser = function(uid) {
    return $http.get('/users/'+uid+'');
  };

  userFactory.addKnowledge = function(knowledgeObject) {
    return $http.post('/users/addKnowledge', knowledgeObject);
  };

  userFactory.updateInfo = function(updateObject){
    return $http.put('/users/updateInfo', updateObject);
  };

  userFactory.follow = function(followObject){
    return $http.post('/users/follow', followObject);
  };

  userFactory.unfollow = function(unfollowObject){
    return $http.put('/users/unfollow', unfollowObject);
  };

  userFactory.subscribe = function(subscribeOject){
    return $http.post('/users/subscribe', subscribeObject);
  };

  userFactory.unsubscribe = function(unsubscribeObject){
    return $http.put('/users/unsubscribe', unsubscribeObject);
  };

  return userFactory;
});
