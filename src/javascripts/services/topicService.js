'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
    return $http.get('/api/topics/allTopics');
  };

  topicFactory.get7Topics = function(){
    return $http.get('/api/topics/limit7');
  };

  topicFactory.getTopic = function(topicInput){
    return $http.get('/api/topics/topic/'+topicInput+'')
  };

  topicFactory.createTopic = function(topicInput){
    return $http.post('/api/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function(tid){
    return $http.delete('/api/topics/delete', tid);
  };

  return topicFactory;
});
