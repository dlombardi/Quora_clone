'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll', 'hc.marked', "oitozero.ngSweetAlert"]);

app.constant('tokenStorageKey', 'my-token');

app.filter('unsafe', function($sce){
  return function(val){
    return $sce.trustAsHtml(val);
  }
})

.run(function($rootScope, $state) {
    $rootScope.$on("logout", function(){
      $rootScope.$broadcast("loggedOut");
    })
    $rootScope.$on('login', function(){
      $rootScope.$broadcast("loggedIn");
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
  $locationProvider.html5Mode(true).hashPrefix('!');;
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
    .state('write', { url: '/write', templateUrl: '/html/general/write.html', controller: 'writeCtrl'})
    .state('thread', { url: '/thread', templateUrl: '/html/general/thread.html', controller: 'threadCtrl'})
    .state('topic', { url: '/topics/:topic?', templateUrl: '/html/general/topic.html', controller: 'topicCtrl'})
    .state('users', { abstract: true, templateUrl: '/html/users/users.html'})
    .state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl'})
    .state('users.profile', { url: '/profile', templateUrl: '/html/users/profile.html', controller: 'profileCtrl'})

  $urlRouterProvider.otherwise('/');
}]);

'use strict';


app.controller('homeCtrl', function($scope, $state, postFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();

  ($scope.getPosts = function(){
    console.log("In get posts ", "Current User:", currentUser);
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question"
    }
    postFactory.getSortedPosts(sorting)
    .success(function(posts){
      if($scope.loggedIn){
        postFactory.formatLikedPosts(posts, currentUser);
        console.log("posts: ", posts);
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
      console.log(topics);
      $scope.topicFeed = topics;
    })
    .error(function(err){
      console.log("error: ", err)
    })
  })();

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
        console.log(post);
      })
      .error(function(err){
        console.log("error: ", err)
      })
    }
  }

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
    $scope.getPosts();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  postFactory.getPostsByTag();

});

app.controller('navCtrl', function($scope, $state, auth, postFactory){
  $scope.loggedIn = auth.isLoggedIn();

  $scope.logout = function(){
    auth.logout();
    $scope.loggedIn = false;
    $state.go('home');
  }

});

'use strict';


app.controller('profileCtrl', function($scope, $state, auth){
  console.log("PROFILE CTRL WORKING");
});

'use strict';

app.controller('threadCtrl', function($scope, $state, postFactory){
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


app.controller('topicCtrl', function($scope, $state, $stateParams, topicFactory, auth, postFactory, $rootScope) {
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

  $scope.togglePostLike = function(index){
    if(!$scope.loggedIn){
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "dislike" : action = "like";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action
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
        type: action
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
        postType: "comment"
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

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })



});

'use strict';

app.controller('usersCtrl', function($scope, $state, auth, userFactory, $rootScope){
  $scope.Login = false;
  $scope.loggedIn = auth.isLoggedIn();

  ($scope.switchState = function(){
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login"
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register"
  })();

  $scope.submit = function(user) {
    var submitFunc = $scope.Login ? auth.login : auth.register;
    console.log("user", user);
    submitFunc(user).success(function(data){
      console.log(data);
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
    postFactory.getPostsByTag(tag);
  }

  $scope.$on("loggedOut", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })

  $scope.$on("loggedIn", function(){
    $scope.loggedIn = auth.isLoggedIn();
  })
});

'use strict';



app.controller('writeCtrl', function($scope, $http, auth, postFactory, topicFactory){
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];



  (function populateTopics(){
    console.log("Populate topics function starts");
    $scope.topics = ["john", "wayne", "Gacy", "adam", "Darius", "Gary", "Dude", "Wilson", "Joe", "alex"];
    // $scope.topics = [];
    // topicFactory.getTopics()
    // .success(function(topics){
    //   $scope.topics = topics;
    //   console.log(topics);
    // })
    // .error(function(err){
    //   console.log("error: ", err)
    // })
  })();

  $scope.checkTopic = function(){
    console.log("NG CHANGE");
    if (!$scope.topic) {
      console.log("EMPTY TOPICS");
    } else {
      console.log("NOT EMPTY");
    }
  }

  $scope.submitQuestion = function(question, currentUser){
    console.log("SUBMIT POST FUNCTION STARTS");
    var questionObject = {
      author: currentUser._id,
      title: question.title,
      tags: question.tags,
      content: question.content,
      topic: question.topic,
      postType: "question"
    }
    postFactory.createPost(questionObject);
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
    var formattedPosts = posts.map(function(post){
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
    return formattedPosts;
  };

  return postFactory;
});



// $http({
//   method: 'GET',
//   url: '/topics'
// }).then(function(data){
//   var specialdata = [{myButt: 'data'}, {myButt: 'butt'}, {myButt: 'rocks'}, {myButt: 'salt'}, {myButt: 'bathsalt'}];
//   $scope.topics = specialdata;
// }).catch(function(err){
//   console.error('errthang is wrong.', err, status);
// });

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
