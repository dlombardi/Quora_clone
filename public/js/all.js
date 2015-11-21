'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll', 'hc.marked', "oitozero.ngSweetAlert"]);

app.constant('tokenStorageKey', 'my-token');

app.filter('unsafe', function($sce){
  return function(val){
    return $sce.trustAsHtml(val);
  }
})

.run(function($rootScope, $state) {
    $rootScope.$on('logout', function(){
      $rootScope.$broadcast("loggedOut");
    })
    $rootScope.$on('login', function(){
      $rootScope.$broadcast("loggedIn");
    })
    $rootScope.$on('tag posts', function(event, posts){
      $rootScope.$broadcast("filteredByTags", posts);
    })
    $rootScope.$on('getNotifications', function(event, posts){
      $rootScope.$broadcast("notifications", posts);
    })
    $rootScope.isNotLoggedIn = function(){
      swal({
        title: "Not Logged In!",
        text: "You must be logged in to complete this action.",
        showCancelButton: true,
        confirmButtonColor: "#B92B27",
        confirmButtonText: "Go to Login?",
        closeOnConfirm: false,
        imageUrl: "../assets/Tied_Hands-100.png"
      },
      function(){
        swal({
          title: "Redirecting!",
          type: "success",
          timer: 750,
          showConfirmButton: false
        });
        $state.go("users.login");
      });
    }
})

app.config(["$stateProvider", "$locationProvider", "$urlRouterProvider", "markedProvider", function($stateProvider, $locationProvider, $urlRouterProvider, markedProvider){
  $locationProvider.html5Mode(true).hashPrefix('!');
  markedProvider.setOptions({
    gfm: true,
    tables: true,
    highlight: function (code, lang) {
      if (lang) {
        return hljs.highlight(lang, code, true).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    }
  });

  $stateProvider
    .state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' })

    .state('thread', { url: '/thread/:thread?', templateUrl: '/html/general/thread.html', controller: 'threadCtrl'})
    .state('compose', { url: '/compose', templateUrl: '/html/general/compose.html', controller: 'composeCtrl'})
    .state('topic', { url: '/topics/:topic?', templateUrl: '/html/general/topic.html', controller: 'topicCtrl'})

    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.notifications', { url: '/notifications', templateUrl: '/html/users/notifications.html', controller: 'notificationsCtrl'})

    .state('users.profile', { url: '/profile/:user?', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})


  $urlRouterProvider.otherwise('/');
}]);

'use strict';



app.controller('composeCtrl', function($scope, $http, $location, $state, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];
  $scope.selectedTopic;
  $scope.toggleDropdown = false;


  (function init(){
    topicFactory.getTopics()
    .success(function(topics){
      $scope.topics = topics;
      console.log(topics);
    })
    .error(function(err){
      console.log("error: ", err)
    })
    var questionObject = {
      postType: "question"
    }
    postFactory.getSortedPosts(questionObject)
    .success(function(questions){
      $scope.topQuestion = questions[0];
    })
    .error(function(err){
      console.log("error: ", err);
    })
  })();



  $scope.addTopicToPost = function(topic){
    $scope.selectedTopic = topic.name;
    $scope.toggleDropdown = true;
    window.setTimeout(function(){
        $scope.toggleDropdown = false;
    }, 50);
  }

  $scope.submitQuestion = function(question, selectedTopic){
    var questionObject = {
      author: currentUser._id,
      title: question.title,
      tags: question.tags,
      content: question.content,
      topic: selectedTopic,
      postType: "question",
      token: auth.getToken()
    }
    console.log(questionObject);
    postFactory.createPost(questionObject)
    .success(function(data){
      $location.path('thread/'+data._id+'');
    })
    .error(function(err){
      console.log(err);
    })
  };

  $scope.submitTopic = function(topic){
    console.log("SUBMIT POST FUNCTION STARTS");
    var topicObject = {
      name: topic.name,
      about: topic.about,
      token: auth.getToken()
    }
    topicFactory.createTopic(topicObject)
    .success(function(topic){
      $scope.topics.push(topic);
    })
    .error(function(err){
      console.log(err);
    })
  };

  $scope.$emit("getNotifications");
});

'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  $scope.getPosts = function(sortingMethod){
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question",
      sortingMethod: sortingMethod
    }
    postFactory.getSortedPosts(sorting)
    .success(function(posts){
      if($scope.loggedIn){
        postFactory.formatLikedPosts(posts, currentUser);
        $scope.posts = posts;
      } else {
        $scope.posts = posts;
      }
    })
    .error(function(err){
      console.log("error: ", err)
    });

    topicFactory.get7Topics()
    .success(function(topics){
      $scope.topicFeed = topics;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  };

  $scope.getPosts("likes");

  $scope.sortLikes = function(){
    $(".filter").removeClass("active");
    $("#likes").addClass("active");
    $scope.getPosts("likes");
  }

  $scope.sortDislikes = function(){
    $(".filter").removeClass("active");
    $("#dislikes").addClass("active");
    $scope.getPosts("dislikes");
  }

  $scope.sortOldest = function(){
    $(".filter").removeClass("active");
    $("#oldest").addClass("active");
    $scope.getPosts("oldest");
  }

  $scope.sortNewest = function(){
    $(".filter").removeClass("active");
    $("#newest").addClass("active");
    $scope.getPosts("newest");
  }

  $scope.togglePostLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.posts[index].likes += 1
          $scope.posts[index].liked = true;
        } else {
          $scope.posts[index].likes -= 1;
          $scope.posts[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.togglePostDislike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "dislike"){
          $scope.posts[index].dislikes += 1
          $scope.posts[index].disliked = true;
        } else {
          $scope.posts[index].dislikes -= 1;
          $scope.posts[index].disliked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleCommentLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.comments[index].likes += 1
          $scope.comments[index].liked = true;
        } else {
          $scope.comments[index].likes -= 1;
          $scope.comments[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleCommentDislike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "dislike"){
          $scope.comments[index].dislikes += 1
          $scope.comments[index].disliked = true;
        } else {
          $scope.comments[index].dislikes -= 1;
          $scope.comments[index].disliked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    }
    postFactory.getSortedComments(sortingObject)
    .success(function(posts){
      if(currentUser){
        postFactory.formatLikedPosts(posts, currentUser);
        $scope.comments = posts;
      } else {
        $scope.comments = posts;
      }
    })
  }

  $scope.hideComments = function(index){
    $scope.posts[index].showComments = false;
  }

  $scope.submitComment = function(comment, post){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: post._id,
        postType: "comment",
        token: auth.getToken()
      }
      postFactory.createPost(commentObject)
      .success(function(post){
        $scope.comments.push(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.$emit("getNotifications")

  $scope.$on('filteredByTags', function(event, posts){
    postFactory.formatLikedPosts(posts, currentUser);
    $scope.posts = posts;
  })

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.getPosts();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  postFactory.getPostsByTag();

});

'use strict';



app.controller('notificationsCtrl', function($scope, $http, auth, userFactory, postFactory, topicFactory){
  $scope.currentUser = auth.currentUser();
  $scope.newNotifications;
  $scope.oldNotifications;

  ($scope.getNotifications = function(){
    $scope.newNotifications = [];
    $scope.oldNotifications = [];
    var userObject = {
      uid: $scope.currentUser._id
    }
    userFactory.getNotifs(userObject)
    .success(function(user){
      $scope.newNotifications = user.notifications.filter(function(notif){
        return notif.seen;
      })
      $scope.oldNotifications = user.notifications.filter(function(notif){
        return !notif.seen;
      })
      userFactory.clearNotifs(userObject)
      .success(function(user){
        console.log("user: ", user);
      })
      .error(function(err){
        console.log("error: ", err);
      })
    })
    .error(function(err){
      console.log("error: ", err);
    })
  })();
});

'use strict';


app.controller('profileCtrl', function($scope, $state, auth){
  console.log("PROFILE CTRL WORKING");

  $scope.$emit("getNotifications");
});

'use strict';

app.controller('threadCtrl', function($scope, $state, postFactory, $rootScope, $stateParams){
  $scope.displayComments = false;
  $scope.displayAnswerForm = false;
  var currentUser = $rootScope.getCurrentUser;

  ($scope.getPost = function(){
    var postObject = {
      pid: $stateParams.thread
    }
    postFactory.getPost(postObject)
    .success(function(question){
      $scope.question = question;
      $scope.topic = question.topic;
    })
    .error(function(err){
      console.log(err);
    });
  })();


  $scope.showComments = function(){
    $scope.displayComments = !$scope.displayComments;
  }

  $scope.showAnswerForm = function(){
    $scope.displayAnswerForm = !$scope.displayAnswerForm;
  }

  $scope.loadMore = function() {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for(var count = 1; count <= showComments; count++) {
      console.log('count is '+ count);
      $scope.comments.push(last + '');//replace last with data.
    }
  };

  $scope.$emit("getNotifications")
});

'use strict';


app.controller('topicCtrl', function($scope, $state, $stateParams, topicFactory, auth, userFactory ,postFactory, $rootScope) {
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  (function getTopicPosts(){
    $scope.posts = [];
    $scope.topicFeed = [];

    topicFactory.getTopic($stateParams.topic)
    .success(function(topic){
      $scope.topic = topic;
      $scope.posts = topic.posts;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();

  $scope.subscribe = function(){
    var subscribeObject = {
      uid: currentUser,
      topic: $stateParams.topic
    }
    userFactory.subscribe(subscribeObject)
    .success(function(data){
      console.log(data);
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.togglePostLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "dislike" : action = "like";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.posts[index].likes += 1
          $scope.posts[index].liked = true;
        } else {
          $scope.posts[index].likes -= 1;
          $scope.posts[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.toggleCommentLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "dislike" : action = "like";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      }
      postFactory.changeStats(statsObject)
      .success(function(post){
        if(action === "like"){
          $scope.comments[index].likes += 1
          $scope.comments[index].liked = true;
        } else {
          $scope.comments[index].likes -= 1;
          $scope.comments[index].liked = false;
        }
      })
      .error(function(err){
        console.log("error: ", err);
      })
    }
  }

  $scope.showComments = function(index){
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    }
    postFactory.getSortedComments(sortingObject)
    .success(function(posts){
      postFactory.formatLikedPosts(posts, currentUser);
      console.log(posts);
      $scope.comments = posts;
    })
  }

  $scope.hideComments = function(index){
    $scope.posts[index].showComments = false;
  }

  $scope.submitComment = function(comment, post){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: post._id,
        postType: "comment",
        token: auth.getToken()
      }
      postFactory.createPost(commentObject)
      .success(function(post){
        $scope.comments.push(post);
        console.log(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.$emit("getNotifications")

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })



});

'use strict';

app.controller('usersCtrl', function($scope, $state, auth, userFactory, postFactory, $rootScope){
  $scope.Login = false;
  $scope.loggedIn = auth.isLoggedIn();
  $scope.currentUser = auth.currentUser();
  $scope.notifications = [];

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    submitFunc(user).success(function(data){
      $scope.$emit('login');
      $state.go('home');
    }).error(function(err){
      swal({
        title: "Input Not Valid",
        text: "Either the username or password was entered incorrectly",
        timer: 2000,
        type: "error",
        confirmButtonColor: "#B92B27"
      });
      $scope.user = {};
    });
  };

  $scope.logout = function(){
    auth.logout();
    $scope.$emit('logout');
    $state.go('home');
  }

  $scope.filterByTag = function(tag){
    postFactory.getPostsByTag(tag)
    .success(function(posts){
      $scope.$emit('tag posts', posts);
    })
    .error(function(err){
      console.log("error: ", err);
    })
  }

  $scope.$on("notifications", function(){
    userFactory.getUser($scope.currentUser._id)
    .success(function(user){
      $scope.newNotifications = user.notifications.filter(function(notif){
        return notif.seen;
      })
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.notifications = [];
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

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
    return $http.post('/auth/register', user).success(function(data){
      auth.saveToken(data.token);
    });
  };

  auth.login = function(user){
    return $http.post('/auth/login', user).success(function(data){
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

  postFactory.createPost = function(newPost) {
    console.log(newPost);
    return $http.post('/posts/add', newPost);
  };

  postFactory.deletePost = function(pid){
    return $http.delete('/posts/delete', pid);
  };

  postFactory.changeStats = function(statObject){
    return $http.put('/posts/changeStats', statObject);
  };

  postFactory.getPost = function(postObject){
    return $http.get('/posts/'+postObject.pid+'');
  };

  postFactory.editPost = function(editObject){
    return $http.put('/posts/edit', editObject);
  };

  postFactory.getPostsByTag = function(tag){
    return $http.get('/posts/sorted/user/topic/tag/'+ tag +'/postType/');
  };

  postFactory.getPostsByTopic = function(topic){
    return $http.get('/posts/sorted/user/topic/'+ topic +'/tag/postType/');
  };

  postFactory.getSortedPosts = function(sorting){
    return $http.get('/posts/sorted/'+sorting.sortingMethod+'/user/topic/tag/postType/'+ sorting.postType +'');
  };

  postFactory.getSortedComments = function(sorting){
    console.log(sorting);
    return $http.get('/posts/sortedComments/'+sorting.sortingMethod+'/post/'+sorting.pid+'');
  };


  postFactory.formatLikedPosts = function(posts, currentUser){
    posts.map(function(post){
      return post.likers.forEach(function(liker){
        if(liker.toString() === currentUser._id.toString()){
          var likedPost = post;
          likedPost.liked = true;
          return likedPost;
        } else {
          return post;
        }
      })
    });
    posts.map(function(post){
      return post.dislikers.forEach(function(disliker){
        if(disliker.toString() === currentUser._id.toString()){
          var dislikedPost = post;
          dislikedPost.disliked = true;
          return dislikedPost;
        } else {
          return post;
        }
      })
    });
  };
  return postFactory;
});

'use strict';

app.factory('topicFactory', function($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function(){
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

'use strict';

app.factory('userFactory', function($window, $http){
  var userFactory= {};

  userFactory.getUser = function(uid) {
    return $http.get('/users/'+uid+'');
  };

  userFactory.getNotifs = function(userObject) {
    return $http.get('/users/notifications/'+userObject.uid+'');
  };

  userFactory.clearNotifs = function(userObject) {
    return $http.post('/users/clearNotifications', userObject);
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
