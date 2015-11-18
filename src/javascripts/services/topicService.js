'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
    return $http.get('/topics');
  };

  topicFactory.get7Topics = function(){
    return $http.get('/topics/limit7');
  };

  topicFactory.getTopic = function(topicInput){
    var formatName = topicInput.replace(" ", "_");
    console.log(formatName);
    return $http.get('/topics/'+formatName+'');
  };

  topicFactory.createTopic = function(topicInput){
    return $http.post('/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function(tid){
    return $http.delete('/topics/delete', tid);
  };

  return topicFactory;
});
