'use strict';

app.factory('userFactory', function($window, $http, postFactory, auth){
  let userFactory = {};

  userFactory.getUser = (uid) => {
    return $http.get(`/users/${uid}`)
    .success(user => {
      postFactory.formatPosts(user.posts, auth.currentUser());
      return user;
    })
  };

  userFactory.getNotifs = (userObject) => {
    return $http.get(`/users/notifications/${userObject.uid}`);
  };

  userFactory.clearNotifs = (userObject) => {
    return $http.post('/users/clearNotifications', userObject);
  };

  userFactory.addKnowledge = (knowledgeObject) => {
    return $http.post('/users/addKnowledge', knowledgeObject);
  };

  userFactory.updateInfo = (updateObject) => {
    let updateInfo = new Object();
    for(let key in updateObject){
      if(updateObject[key].length !== 0){
        updateInfo[key] = updateObject[key];
      }
    }
    updateInfo.uid = auth.currentUser()._id
    return $http.put('/users/updateInfo', updateInfo);
  };

  userFactory.follow = (followObject) => {
    return $http.post('/users/follow', followObject);
  };

  userFactory.unfollow = (unfollowObject) => {
    return $http.put('/users/unfollow', unfollowObject);
  };

  userFactory.subscribe = (subscribeObject) => {
    return $http.post('/users/subscribe', subscribeObject);
  };

  userFactory.unsubscribe = (unsubscribeObject) => {
    return $http.put('/users/unsubscribe', unsubscribeObject);
  };


  return userFactory;
});
