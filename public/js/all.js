'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll']);

app.run(function($rootScope, auth) {
    $rootScope.getCurrentUser = auth.currentUser();
    $rootScope.loggedIn = false;
})

app.constant('tokenStorageKey', 'my-token');

app.config(function($stateProvider, $locationProvider, $urlRouterProvider){
  $stateProvider

    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('post', { url: '/post', templateUrl: '/html/general/write.html', controller: 'writeCtrl'})
    .state('thread', { url: '/thread', templateUrl: '/html/general/thread.html', controller: 'threadCtrl'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
});

'use strict';


app.controller('homeCtrl', function($scope, $state, $rootScope, postFactory, topicFactory, auth) {
  var currentUser = $rootScope.getCurrentUser;
  $scope.posts;
  $scope.topicFeed;

  function getPosts(){
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question"
    }
    postFactory.getTopStories(sorting)
    .success(function(posts){
      $scope.posts = posts;
    })
    .error(function(err){
      console.log("error: ", err)
    });

    topicFactory.get7Topics()
    .success(function(topics){
      $scope.topicFeed = topics;
      console.log(topics);
    })
    .error(function(err){
      console.log("error: ", err)
    })
  }
  getPosts();

  $scope.likePost = function(post){
    var statsObject = {
      pid: post._id,
      type: "like"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      getPosts();
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }

  $scope.dislike = function(post){
    var statsObject = {
      pid: post._id,
      type: "dislike"
    }
    postFactory.changeStats(statsObject)
    .success(function(post){
      getPosts();
    })
    .error(function(post){
      console.log("error: ", err);
    })
  }
});

app.controller('navCtrl', function($scope, $state, auth, $rootScope){
  var currentUser = $rootScope.getCurrentUser;
  var loggedIn = $rootScope.loggedIn;

  $scope.logout = function(){
    auth.logout();
    $rootScope.loggedIn = false;
    $state.go('home');
  }
});

'use strict';


app.controller('profileCtrl', function($scope, $state, auth, $rootScope){
  var currentUser = $rootScope.getCurrentUser;
  console.log("PROFILE CTRL WORKING");
});

'use strict';

app.controller('threadCtrl', function($scope, $state, $rootScope, postFactory){
  $scope.displayComments = false;
  $scope.displayAnswerForm = false;
  var currentUser = $rootScope.getCurrentUser;
 

  $scope.showComments = function(){
    $scope.displayComments = !$scope.displayComments;
  }

  $scope.showAnswerForm = function(){
    $scope.displayAnswerForm = !$scope.displayAnswerForm;
  }


  $scope.comments = [{author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god", likes: 19}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god", views: 19}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}, {author: "billy", content: "this is a comment on a question in quora oh my god oh my god oh my god"}];

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };
});

'use strict';



app.controller('usersCtrl', function($scope, $state, auth, userFactory, $rootScope){
  $scope.Login = false;
  var currentUser = $rootScope.getCurrentUser;

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(data){
      $rootScope.loggedIn = !$rootScope.loggedIn;
      $state.go('home');
    }).error(function(err){
      console.log(err);
      $scope.user = {};
      alert(err);
    });
  };
});

'use strict';

app.controller('writeCtrl', function($scope, $state, postFactory, auth){
  console.log("post CTRL WORKING");

  $scope.comments = ['test comment 1','test comment 2','test comment 3','test comment 4','test comment 5','test comment 6','test comment 7','test comment 8'];

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1]; //'test 8'
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };
});

'use strict';

app.factory('auth', function($window, $http, tokenStorageKey) {
  var auth = {};

  auth.saveToken = function(token) {
    $window.localStorage[tokenStorageKey] = token;
  };

  auth.getToken = function() {
    return $window.localStorage[tokenStorageKey];
  };

  auth.isLoggedIn = function(){
    var token = auth.getToken();
    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function(){
    if(auth.isLoggedIn()){
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload;
    }
  };

  auth.register = function(user){
    return $http.post('/users/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.login = function(user){
    return $http.post('/users/login', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.logout = function(){
    $window.localStorage.removeItem(tokenStorageKey);
  };

  return auth;
});

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

  postFactory.getTopStories = function(sorting){
    return $http.get('/posts/sorted/user/topic/tag/postType/'+ sorting.postType +'');
  };

  return postFactory;
});

'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
    return $http.get('/topics');
  };

  topicFactory.get7Topics = function(){
    return $http.get('/topics/limit7');
  };

  topicFactory.createTopic = function(topicInput){
    return $http.post('/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function(tid){
    return $http.delete('/topics/delete', tid);
  };

  return topicFactory;
});

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
