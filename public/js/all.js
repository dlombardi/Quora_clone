'use strict';

var app = angular.module('quora', ['ui.router', 'infinite-scroll', 'hc.marked', "ngFileUpload"]);

app.constant('tokenStorageKey', 'my-token');

app.filter('unsafe', function ($sce) {
  return function (val) {
    return $sce.trustAsHtml(val);
  };
}).run(function ($rootScope, $state) {
  $rootScope.$on('logout', function () {
    $rootScope.$broadcast("loggedOut");
  });
  $rootScope.$on('login', function () {
    $rootScope.$broadcast("loggedIn");
  });
  $rootScope.$on('tag posts', function (event, posts) {
    $rootScope.$broadcast("filteredByTags", posts);
  });
  $rootScope.$on('getNotifications', function (event, posts) {
    $rootScope.$broadcast("notifications", posts);
  });
  $rootScope.$on('notHome', function () {
    $rootScope.$broadcast("removeTagFilter");
  });
  $rootScope.$on('inHome', function () {
    $rootScope.$broadcast("addTagFilter");
  });
  $rootScope.isNotLoggedIn = function () {
    swal({
      title: "Not Logged In!",
      text: "You must be logged in to complete this action.",
      showCancelButton: true,
      confirmButtonColor: "#B92B27",
      confirmButtonText: "Go to Login?",
      closeOnConfirm: false,
      imageUrl: "../assets/Tied_Hands-100.png"
    }, function () {
      swal({
        title: "Redirecting!",
        type: "success",
        timer: 750,
        showConfirmButton: false
      });
      $state.go("users.login");
    });
  };
});

app.config(["$stateProvider", "$locationProvider", "$urlRouterProvider", "markedProvider", function ($stateProvider, $locationProvider, $urlRouterProvider, markedProvider) {
  $locationProvider.html5Mode(true).hashPrefix('!');
  markedProvider.setOptions({
    gfm: true,
    tables: true,
    highlight: function highlight(code, lang) {
      if (lang) {
        return hljs.highlight(lang, code, true).value;
      } else {
        return hljs.highlightAuto(code).value;
      }
    }
  });

  $stateProvider.state('home', { url: '/', templateUrl: '/html/general/home.html', controller: 'homeCtrl' }).state('thread', { url: '/thread/:thread?', templateUrl: '/html/general/thread.html', controller: 'threadCtrl' }).state('compose', { url: '/compose', templateUrl: '/html/general/compose.html', controller: 'composeCtrl' }).state('topic', { url: '/topics/:topic?', templateUrl: '/html/general/topic.html', controller: 'topicCtrl' }).state('users', { abstract: true, templateUrl: '/html/users/users.html' }).state('users.login', { url: '/login', templateUrl: '/html/users/form.html', controller: 'usersCtrl' }).state('users.notifications', { url: '/notifications', templateUrl: '/html/users/notifications.html', controller: 'notificationsCtrl' }).state('users.profile', { url: '/profile/:user?', templateUrl: '/html/users/profile.html', controller: 'profileCtrl' });

  $urlRouterProvider.otherwise('/');
}]);
'use strict';

app.controller('composeCtrl', function ($scope, $http, $location, $state, auth, postFactory, topicFactory) {
  var currentUser = auth.currentUser();
  $(document).foundation();
  $scope.topics = [];
  $scope.selectedTopic;
  $scope.toggleDropdown = false;

  (function init() {
    topicFactory.getTopics().success(function (topics) {
      $scope.topics = topics;
    }).error(function (err) {
      console.log("error: ", err);
    });
    var questionObject = {
      postType: "question"
    };
    postFactory.getSortedPosts(questionObject).success(function (questions) {
      $scope.topQuestion = questions[0];
    });
  })();

  $scope.addTopicToPost = function (topic) {
    $scope.selectedTopic = topic.name;
    $scope.toggleDropdown = true;
    window.setTimeout(function () {
      $scope.toggleDropdown = false;
    }, 50);
  };

  $scope.submitQuestion = function (isValid, question, selectedTopic) {
    if (isValid) {
      var questionObject = {
        author: currentUser._id,
        title: question.title,
        tags: question.tags,
        content: question.content,
        topic: selectedTopic,
        postType: "question",
        token: auth.getToken()
      };
      postFactory.createPost(questionObject).success(function (data) {
        $location.path('thread/' + data._id + '');
      }).error(function (err) {
        console.log(err);
      });
    } else {
      swal({
        title: "Invalid Form",
        text: "Incorrect Inputs",
        timer: 2000,
        type: "error",
        confirmButtonColor: "#B92B27"
      });
    }
  };

  $scope.submitTopic = function (topic) {
    console.log("SUBMIT POST FUNCTION STARTS");
    var topicObject = {
      name: topic.name,
      about: topic.about,
      token: auth.getToken()
    };
    topicFactory.createTopic(topicObject).success(function (topic) {
      $scope.topics.push(topic);
      swal({
        title: "Success!",
        text: "You've made a new Topic!",
        timer: 750,
        showConfirmButton: false
      });
      $state.go("compose");
    }).error(function (err) {
      swal({
        title: "Error!",
        text: "Missing fields!",
        showConfirmButton: true
      });
    });
  };

  $scope.$emit("notHome");
  $scope.$emit("getNotifications");
});
'use strict';

app.controller('homeCtrl', function ($scope, $state, postFactory, userFactory, topicFactory, auth, marked, $sce, $rootScope) {
  $scope.posts;
  $scope.topicFeed;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $(document).foundation();

  if (!$scope.loggedIn) {
    $state.go("users.login");
  }

  $scope.getPosts = function (sortingMethod) {
    $scope.posts = [];
    $scope.topicFeed = [];
    var sorting = {
      postType: "question",
      sortingMethod: sortingMethod
    };
    postFactory.getSortedPosts(sorting).success(function (posts) {
      $scope.posts = posts;
    });
    topicFactory.get7Topics().success(function (posts) {
      $scope.topicFeed = posts;
    });
    userFactory.getUser(currentUser._id).success(function (user) {
      $scope.subscriptions = user.subscriptions;
    });
  };

  $scope.getPosts("likes");

  $scope.sortLikes = function () {
    $(".filter").removeClass("active");
    $("#likes").addClass("active");
    $scope.getPosts("likes");
  };

  $scope.sortDislikes = function () {
    $(".filter").removeClass("active");
    $("#dislikes").addClass("active");
    $scope.getPosts("dislikes");
  };

  $scope.sortOldest = function () {
    $(".filter").removeClass("active");
    $("#oldest").addClass("active");
    $scope.getPosts("oldest");
  };

  $scope.sortNewest = function () {
    $(".filter").removeClass("active");
    $("#newest").addClass("active");
    $scope.getPosts("newest");
  };

  $scope.sortSubscriptions = function () {
    $(".filter").removeClass("active");
    $("#subscriptions").addClass("active");
    postFactory.subscriptionsPosts(currentUser._id).success(function (posts) {
      $scope.posts = posts;
    });
  };

  $scope.togglePostLike = function (postSpecies, index) {
    var postType = undefined;
    var action = undefined;
    postSpecies === "post" ? postType = $scope.posts : postType = $scope.comments;
    postType[index].liked ? action = "unlike" : action = "like";
    var statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    };
    postFactory.changeStats(statsObject).success(function (post) {
      if (action === "like") {
        postType[index].likes += 1;
        postType[index].liked = true;
      } else {
        postType[index].likes -= 1;
        postType[index].liked = false;
      }
    });
  };

  $scope.togglePostDislike = function (postSpecies, index) {
    var postType = undefined;
    var action = undefined;
    postSpecies === "post" ? postType = $scope.posts : postType = $scope.comments;
    postType[index].disliked ? action = "undo" : action = "dislike";
    var statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    };
    postFactory.changeStats(statsObject).success(function (post) {
      if (action === "dislike") {
        postType[index].dislikes += 1;
        postType[index].disliked = true;
      } else {
        postType[index].dislikes -= 1;
        postType[index].disliked = false;
      }
    });
  };

  $scope.showComments = function (index) {
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    };
    postFactory.getSortedComments(sortingObject).success(function (posts) {
      $scope.comments = posts;
    });
  };

  $scope.hideComments = function (index) {
    $scope.posts[index].showComments = false;
  };

  $scope.submitComment = function (comment, post) {
    var commentObject = {
      content: comment,
      author: currentUser._id,
      responseTo: post._id,
      postType: "comment",
      token: auth.getToken()
    };
    postFactory.createPost(commentObject).success(function (post) {
      $scope.comments.push(post);
    }).error(function (err) {
      console.log("failed to submit comment");
      console.error(err);
    });
  };

  $scope.deletePost = function (post, $index) {
    postFactory.deletePost(post._id).success(function (post) {
      switch (post.postType) {
        case "comment":
          $scope.comments.splice($index, 1);
          break;
        case "question":
          $scope.posts.splice($index, 1);
          break;
      }
    }).error(function (err) {
      console.log("failed at deletePost function ");
      console.error(err);
    });
  };

  $scope.$emit("getNotifications");

  $scope.$emit("inHome");

  $scope.$on('filteredByTags', function (event, posts) {
    $scope.posts = posts;
  });
  $scope.$on("loggedOut", function () {
    $scope.loggedIn = auth.isLoggedIn();
    $scope.getPosts();
  });
  $scope.$on("loggedIn", function () {
    $scope.loggedIn = auth.isLoggedIn();
  });
});
'use strict';

app.controller('notificationsCtrl', function ($scope, $http, auth, userFactory, postFactory, topicFactory) {
  $scope.currentUser = auth.currentUser();
  $scope.newNotifications;
  $scope.oldNotifications;
  $(document).foundation();

  ($scope.getNotifications = function () {
    $scope.newNotifications = [];
    $scope.oldNotifications = [];
    var userObject = {
      uid: $scope.currentUser._id
    };
    userFactory.getNotifs(userObject).success(function (user) {
      $scope.newNotifications = user.notifications.filter(function (notif) {
        return !notif.seen;
      });
      $scope.oldNotifications = user.notifications.filter(function (notif) {
        return notif.seen;
      });
      userFactory.clearNotifs(userObject).success(function (user) {
        console.log("user: ", user);
      }).error(function (err) {
        console.log("error: ", err);
      });
    }).error(function (err) {
      console.log("error: ", err);
    });
  })();

  $scope.$emit("notHome");
});
'use strict';

app.controller('profileCtrl', function ($scope, $log, $stateParams, $state, auth, userFactory, postFactory) {
  $(document).foundation();
  $scope.currentUser = false;
  $scope.followed = false;
  var currentUser = auth.currentUser();
  userFactory.getUser($stateParams.user).success(function (user) {
    if (user._id === auth.currentUser()._id) {
      $scope.currentUser = true;
    }
    user.followers.indexOf(currentUser._id) !== -1 ? $scope.followed = true : $scope.followed = false;
    $scope.user = user;
  });

  $scope.togglePostLike = function (postSpecies, index) {
    var postType = undefined;
    var action = undefined;
    postSpecies === "post" ? postType = $scope.user.posts : postType = $scope.comments;
    postType[index].liked ? action = "unlike" : action = "like";
    var statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    };
    postFactory.changeStats(statsObject).success(function (post) {
      if (action === "like") {
        postType[index].likes += 1;
        postType[index].liked = true;
      } else {
        postType[index].likes -= 1;
        postType[index].liked = false;
      }
    });
  };

  $scope.togglePostDislike = function (postSpecies, index) {
    var postType = undefined;
    var action = undefined;
    postSpecies === "post" ? postType = $scope.user.posts : postType = $scope.comments;
    postType[index].disliked ? action = "undo" : action = "dislike";
    var statsObject = {
      pid: postType[index]._id,
      uid: currentUser._id,
      type: action,
      token: auth.getToken()
    };
    postFactory.changeStats(statsObject).success(function (post) {
      if (action === "dislike") {
        postType[index].dislikes += 1;
        postType[index].disliked = true;
      } else {
        postType[index].dislikes -= 1;
        postType[index].disliked = false;
      }
    });
  };

  $scope.showComments = function (index) {
    $scope.user.posts[index].showComments = true;
    var comments = $scope.user.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.user.posts[index]._id
    };
    postFactory.getSortedComments(sortingObject).success(function (posts) {
      $scope.comments = posts;
    });
  };

  $scope.hideComments = function (index) {
    $scope.user.posts[index].showComments = false;
  };

  $scope.submitComment = function (comment, post) {
    var commentObject = {
      content: comment,
      author: currentUser._id,
      responseTo: post._id,
      postType: "comment",
      token: auth.getToken()
    };
    postFactory.createPost(commentObject).success(function (post) {
      $scope.comments.push(post);
    }).error(function (err) {
      $log.warning("failed to submit comment");
      $log.error(err);
    });
  };

  $scope.deletePost = function (post, $index) {
    postFactory.deletePost(post._id).success(function (post) {
      switch (post.postType) {
        case "comment":
          $scope.comments.splice($index, 1);
          break;
        case "question":
          $scope.posts.splice($index, 1);
          break;
      }
    }).error(function (err) {
      $log.warning("failed at deletePost function ");
      $log.error(err);
    });
  };

  $scope.updateInfo = function (info) {
    userFactory.updateInfo(info).then(function (user) {
      $scope.user = user.data;
    });
  };

  $scope.$emit("getNotifications");
  $scope.$emit("notHome");
});
'use strict';

app.controller('threadCtrl', function ($scope, $state, auth, postFactory, $rootScope, $stateParams) {
  $scope.displayAnswerForm = false;
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $(document).foundation();

  $scope.answers;
  $scope.comments;
  $scope.question;

  ($scope.getPost = function () {
    postFactory.getPost($stateParams.thread).success(function (question) {
      $scope.question = question;
      $scope.topic = question.topic;
      $scope.comments = question.comments;
      var sortingObject = {
        sortingMethod: "likes",
        pid: question._id
      };
      postFactory.getSortedAnswers(sortingObject).success(function (answers) {
        $scope.answers = answers;
      });
    }).error(function (err) {
      console.log(err);
    });
  })();

  $scope.submitAnswer = function (answer, question) {
    var answerObject = {
      content: answer,
      author: currentUser._id,
      responseTo: question._id,
      postType: "answer",
      token: auth.getToken()
    };
    postFactory.createPost(answerObject).success(function (answer) {
      $scope.answers.push(answer);
    }).error(function (err) {
      console.log("error: ", err);
    });
  };

  $scope.toggleAnswerLike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.answers[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.answers[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "like") {
          $scope.answers[index].likes += 1;
          $scope.answers[index].liked = true;
        } else {
          $scope.answers[index].likes -= 1;
          $scope.answers[index].liked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.toggleAnswerDislike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.answers[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.answers[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "dislike") {
          $scope.answers[index].dislikes += 1;
          $scope.answers[index].disliked = true;
        } else {
          $scope.answers[index].dislikes -= 1;
          $scope.answers[index].disliked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.toggleCommentLike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "like") {
          $scope.comments[index].likes += 1;
          $scope.comments[index].liked = true;
        } else {
          $scope.comments[index].likes -= 1;
          $scope.comments[index].liked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.toggleCommentDislike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "dislike") {
          $scope.comments[index].dislikes += 1;
          $scope.comments[index].disliked = true;
        } else {
          $scope.comments[index].dislikes -= 1;
          $scope.comments[index].disliked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.showComments = function () {
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    };
    postFactory.getSortedComments(sortingObject).success(function (posts) {
      if (currentUser) {
        postFactory.formatPosts(posts, currentUser);
        $scope.comments = posts;
      } else {
        $scope.comments = posts;
      }
    });
  };

  $scope.submitComment = function (comment, question) {
    console.log(question);
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: question._id,
        postType: "comment",
        token: auth.getToken()
      };
      postFactory.createPost(commentObject).success(function (post) {
        $scope.comments.push(post);
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.loadMore = function () {
    var last = $scope.comments[$scope.comments.length - 1];
    var showComments = 8;
    for (var count = 1; count <= showComments; count++) {
      console.log('count is ' + count);
      $scope.comments.push(last + ''); //replace last with data.
    }
  };

  $scope.$emit("notHome");
  $scope.$emit("getNotifications");
});
'use strict';

app.controller('topicCtrl', function ($scope, $state, $stateParams, topicFactory, auth, userFactory, postFactory, $rootScope) {
  var currentUser = auth.currentUser();
  $scope.loggedIn = auth.isLoggedIn();
  $scope.posts;
  $scope.topic;
  $scope.subscribed = false;
  $(document).foundation();

  (function getTopicPosts() {
    topicFactory.getTopic($stateParams.topic).success(function (topic) {
      console.log("TOPIC: ", topic);
      topic.subscribers.forEach(function (subscriber) {
        subscriber === currentUser._id ? $scope.subscribed = true : $scope.subscribed = false;
      });
      $scope.topic = topic;
      postFactory.formatPosts(topic.posts, currentUser);
      $scope.posts = topic.posts;
    }).error(function (err) {
      console.log("error: ", err);
    });
  })();

  $scope.subscribe = function () {
    var subscribeObject = {
      uid: currentUser._id,
      topic: $stateParams.topic
    };
    console.log(subscribeObject);
    userFactory.subscribe(subscribeObject).success(function (data) {
      $scope.subscribed = true;
    }).error(function (err) {
      console.log("error: ", err);
    });
  };

  $scope.unsubscribe = function () {
    var unsubscribeObject = {
      uid: currentUser._id,
      topic: $stateParams.topic
    };
    userFactory.unsubscribe(unsubscribeObject).success(function (data) {
      $scope.subscribed = false;
    }).error(function (err) {
      console.log("error: ", err);
    });
  };

  $scope.togglePostLike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "like") {
          $scope.posts[index].likes += 1;
          $scope.posts[index].liked = true;
        } else {
          $scope.posts[index].likes -= 1;
          $scope.posts[index].liked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.togglePostDislike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.posts[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.posts[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "dislike") {
          $scope.posts[index].dislikes += 1;
          $scope.posts[index].disliked = true;
        } else {
          $scope.posts[index].dislikes -= 1;
          $scope.posts[index].disliked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.toggleCommentLike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].liked ? action = "unlike" : action = "like";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "like") {
          $scope.comments[index].likes += 1;
          $scope.comments[index].liked = true;
        } else {
          $scope.comments[index].likes -= 1;
          $scope.comments[index].liked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.toggleCommentDislike = function (index) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var action;
      $scope.comments[index].disliked ? action = "undo" : action = "dislike";
      var statsObject = {
        pid: $scope.comments[index]._id,
        uid: currentUser._id,
        type: action,
        token: auth.getToken()
      };
      postFactory.changeStats(statsObject).success(function (post) {
        if (action === "dislike") {
          $scope.comments[index].dislikes += 1;
          $scope.comments[index].disliked = true;
        } else {
          $scope.comments[index].dislikes -= 1;
          $scope.comments[index].disliked = false;
        }
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };
  $scope.showComments = function (index) {
    $scope.posts[index].showComments = true;
    var comments = $scope.posts[index].comments;
    var sortingObject = {
      sortingMethod: "likes",
      pid: $scope.posts[index]._id
    };
    postFactory.getSortedComments(sortingObject).success(function (posts) {
      postFactory.formatPosts(posts, currentUser);
      console.log(posts);
      $scope.comments = posts;
    });
  };

  $scope.hideComments = function (index) {
    $scope.posts[index].showComments = false;
  };

  $scope.submitComment = function (comment, post) {
    if (!$scope.loggedIn) {
      $rootScope.isNotLoggedIn();
    } else {
      var commentObject = {
        content: comment,
        author: currentUser._id,
        responseTo: post._id,
        postType: "comment",
        token: auth.getToken()
      };
      postFactory.createPost(commentObject).success(function (post) {
        $scope.comments.push(post);
        console.log(post);
      }).error(function (err) {
        console.log("error: ", err);
      });
    }
  };

  $scope.$emit("notHome");
  $scope.$emit("getNotifications");

  $scope.$on("loggedOut", function () {
    $scope.loggedIn = auth.isLoggedIn();
  });

  $scope.$on("loggedIn", function () {
    $scope.loggedIn = auth.isLoggedIn();
  });
});
'use strict';

app.controller('usersCtrl', function ($scope, $state, auth, userFactory, postFactory, $rootScope, Upload, $timeout) {
  $scope.Login = false;
  $scope.tagFilter = true;
  $scope.loggedIn = auth.isLoggedIn();
  $scope.currentUser = auth.currentUser();
  $scope.newNotifications = [];

  ($scope.switchState = function () {
    $scope.Login = !$scope.Login;
    $scope.Login ? $scope.currentState = "Create Account" : $scope.currentState = "Go to Login";
    $scope.Login ? $scope.formState = "Login" : $scope.formState = "Register";
  })();

  $scope.login = function (username, password) {
    var user = {
      username: username,
      password: password
    };
    auth.login(user).success(function (data) {
      $scope.$emit('login');
      $state.go('home');
    }).error(function (err) {
      swal({
        title: "Input Not Valid??",
        text: "Either the username or password was entered incorrectly",
        timer: 2000,
        type: "error",
        confirmButtonColor: "#B92B27"
      });
    });
  };

  $scope.register = function (file) {
    file.upload = Upload.upload({
      url: 'auth/register',
      data: {
        file: file,
        username: $scope.username,
        email: $scope.email,
        fullName: $scope.fullName,
        password: $scope.password
      }
    });
    file.upload.then(function (res) {
      auth.saveToken(res.data.token);
      $scope.$emit('login');

      $timeout(function () {
        file.result = res.data;
        $state.go('home');
      });
    }, function (res) {
      if (res.status > 0) $scope.errorMsg = res.status + ': ' + res.data;
    }, function (evt) {
      file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
    });
  };

  $scope.logout = function () {
    auth.logout();
    $scope.$emit('logout');
    $state.go('users.login');
  };

  $scope.filterByTag = function (tag) {
    postFactory.getPostsByTag(tag).success(function (posts) {
      $scope.$emit('tag posts', posts);
    }).error(function (err) {
      console.log("error: ", err);
    });
  };

  $scope.$on("removeTagFilter", function () {
    $scope.tagFilter = false;
  });

  $scope.$on("addTagFilter", function () {
    $scope.tagFilter = true;
  });

  $scope.$on("notifications", function () {
    userFactory.getUser($scope.currentUser._id).success(function (user) {
      $scope.picture = auth.loggedInUser.picture;
      $scope.newNotifications = user.notifications.filter(function (notif) {
        return !notif.seen;
      });
    }).error(function (err) {
      console.log("error: ", err);
    });
  });

  $scope.$on("loggedOut", function () {
    $scope.loggedIn = auth.isLoggedIn();
    $scope.notifications = [];
  });

  $scope.$on("loggedIn", function () {
    $scope.loggedIn = auth.isLoggedIn();
    $scope.currentUser = auth.currentUser();
    userFactory.getUser($scope.currentUser._id).success(function (user) {
      $scope.picture = auth.loggedInUser.picture;
      $scope.newNotifications = user.notifications.filter(function (notif) {
        return !notif.seen;
      });
    }).error(function (err) {
      console.log("error: ", err);
    });
  });
});
"use strict";

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
'use strict';

app.factory('auth', function ($window, $http, tokenStorageKey) {
  var auth = {};

  auth.loggedInUser;

  auth.saveToken = function (token) {
    $window.localStorage[tokenStorageKey] = token;
  };

  auth.getToken = function () {
    return $window.localStorage[tokenStorageKey];
  };

  auth.isLoggedIn = function () {
    var token = auth.getToken();
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function () {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $http.get('/users/' + payload._id).then(function (res) {
        auth.loggedInUser = res.data;
      }).catch(function (err) {
        console.log("err", err);
      });
      return payload;
    }
  };

  auth.register = function (user) {
    return $http.post('/auth/register', user).success(function (data) {
      auth.saveToken(data.token);
    });
  };

  auth.login = function (user) {
    return $http.post('/auth/login', user).success(function (data) {
      auth.saveToken(data.token);
    });
  };

  auth.logout = function () {
    $window.localStorage.removeItem(tokenStorageKey);
  };

  return auth;
});
'use strict';

app.factory('postFactory', function ($window, $http, auth) {
  var postFactory = {};

  postFactory.createPost = function (newPost) {
    return $http.post('/posts/add', newPost);
  };

  postFactory.deletePost = function (pid) {
    return $http.delete('/posts/delete/' + pid);
  };

  postFactory.changeStats = function (statObject) {
    return $http.put('/posts/changeStats', statObject);
  };

  postFactory.getPost = function (pid) {
    return $http.get('/posts/' + pid);
  };

  postFactory.editPost = function (editObject) {
    return $http.put('/posts/edit', editObject);
  };

  postFactory.getPostsByTag = function (tag) {
    return $http.get('/posts/sorted/user/topic/tag/' + tag + '/postType/').success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.getPostsByTopic = function (topic) {
    return $http.get('/posts/sorted/user/topic/' + topic + '/tag/postType/').success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.getSortedPosts = function (sorting) {
    return $http.get('/posts/sorted/' + sorting.sortingMethod + '/user/topic/tag/postType/' + sorting.postType).success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.subscriptionsPosts = function (uid) {
    return $http.get('/posts/sorted/user/' + uid + '/topic/tag/postType/').success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.getSortedComments = function (sorting) {
    return $http.get('/posts/sortedComments/' + sorting.sortingMethod + '/post/' + sorting.pid).success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.getSortedAnswers = function (sorting) {
    return $http.get('/posts/sortedComments/' + sorting.sortingMethod + '/post/' + sorting.pid).success(function (posts) {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    });
  };

  postFactory.formatLikedPosts = function (posts, currentUser) {
    posts.map(function (post) {
      return post.likers.forEach(function (liker) {
        if (liker.toString() === currentUser._id.toString()) {
          var likedPost = post;
          likedPost.liked = true;
          return likedPost;
        } else {
          return post;
        }
      });
    });
    posts.map(function (post) {
      return post.dislikers.forEach(function (disliker) {
        if (disliker.toString() === currentUser._id.toString()) {
          var dislikedPost = post;
          dislikedPost.disliked = true;
          return dislikedPost;
        } else {
          return post;
        }
      });
    });
  };

  postFactory.formatTags = function (posts) {
    posts.map(function (post) {
      console.log(posts);
      var formattedTags = "";
      post.tags.forEach(function (tag) {
        formattedTags += tag + ", ";
      });
      post.tags = formattedTags;
      return post;
    });
  };

  postFactory.formatUserPosts = function (posts, currentUser) {
    posts.map(function (post) {
      post.author._id.toString() === currentUser._id.toString() ? post.userPost = true : post.userPost = false;
      post.answers.length > 0 ? post.answerWritten = true : post.answerWritten = false;
    });
  };

  postFactory.formatPosts = function (posts, currentUser) {
    postFactory.formatLikedPosts(posts, currentUser);
    postFactory.formatUserPosts(posts, currentUser);
    postFactory.formatTags(posts);
    return posts;
  };

  return postFactory;
});
'use strict';

app.factory('topicFactory', function ($window, $http) {
  var topicFactory = {};

  topicFactory.getTopics = function () {
    return $http.get('/topics/allTopics');
  };

  topicFactory.subscribedTopics = function () {
    return $http.get('/topics/allTopics');
  };

  topicFactory.get7Topics = function () {
    return $http.get('/topics/limit7');
  };

  topicFactory.getTopic = function (topicInput) {
    return $http.get('/topics/topic/' + topicInput);
  };

  topicFactory.createTopic = function (topicInput) {
    return $http.post('/topics/add', topicInput);
  };

  topicFactory.deleteTopic = function (tid) {
    return $http.delete('/topics/delete', tid);
  };

  return topicFactory;
});
'use strict';

app.factory('userFactory', function ($window, $http, postFactory, auth) {
  var userFactory = {};

  userFactory.getUser = function (uid) {
    return $http.get('/users/' + uid).success(function (user) {
      postFactory.formatPosts(user.posts, auth.currentUser());
      return user;
    });
  };

  userFactory.getNotifs = function (userObject) {
    return $http.get('/users/notifications/' + userObject.uid);
  };

  userFactory.clearNotifs = function (userObject) {
    return $http.post('/users/clearNotifications', userObject);
  };

  userFactory.addKnowledge = function (knowledgeObject) {
    return $http.post('/users/addKnowledge', knowledgeObject);
  };

  userFactory.updateInfo = function (updateObject) {
    var updateInfo = new Object();
    for (var key in updateObject) {
      if (updateObject[key].length !== 0) {
        updateInfo[key] = updateObject[key];
      }
    }
    updateInfo.uid = auth.currentUser()._id;
    return $http.put('/users/updateInfo', updateInfo);
  };

  userFactory.follow = function (followObject) {
    return $http.post('/users/follow', followObject);
  };

  userFactory.unfollow = function (unfollowObject) {
    return $http.put('/users/unfollow', unfollowObject);
  };

  userFactory.subscribe = function (subscribeObject) {
    return $http.post('/users/subscribe', subscribeObject);
  };

  userFactory.unsubscribe = function (unsubscribeObject) {
    return $http.put('/users/unsubscribe', unsubscribeObject);
  };

  return userFactory;
});