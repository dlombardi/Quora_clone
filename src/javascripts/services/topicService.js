'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
    return $http.get('/topics/allTopics');
  };

  topicFactory.subscribedTopics = function(){
    return $http.get('/topics/allTopics');
  };

  topicFactory.get7Topics = function(){
    return $http.get('/topics/limit7');
  };

  topicFactory.getTopic = function(topicInput){
    return $http.get('/topics/topic/'+topicInput+'')
  };

  topicFactory.createTopic = function(topicInput){
    return $http.post('/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function(tid){
    return $http.delete('/topics/delete', tid);
  };

  return topicFactory;
});
