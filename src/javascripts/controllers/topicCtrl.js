'use strict';


app.controller('topicCtrl', function($scope, $state, $stateParams, topicFactory, auth) {

  (function getTopic(){
    topicFactory.getTopic($stateParams.topic)
    .success(function(data){
      console.log(data);
    })
    .error(function(err){
      console.log(err);
    })
  })();
});
