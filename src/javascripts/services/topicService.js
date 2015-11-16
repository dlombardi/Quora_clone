'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
    return $http.get('/topics');
  };

  topicFactory.createTopic = function(topicInput){
    return $http.post('/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function(tid){
    return $http.delete('/topics/delete', tid);
  };

  return topicFactory;
});
