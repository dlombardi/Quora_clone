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

  postFactory.getPost = function(postObject){
    return $http.get(`/posts/${postObject.pid}`);
  };

  postFactory.editPost = function(editObject){
    return $http.put('/posts/edit', editObject);
  };

  postFactory.getPostsByTag = function(tag){
    return $http.get(`/posts/sorted/user/topic/tag/${tag}/postType/`);
  };

  postFactory.getPostsByTopic = function(topic){
    return $http.get(`/posts/sorted/user/topic/${topic}/tag/postType/`);
  };

  postFactory.getSortedPosts = function(sorting){
    return $http.get(`/posts/sorted/${sorting.sortingMethod}/user/topic/tag/postType/${sorting.postType}`);
  };

  postFactory.subscriptionsPosts = function(uid){
    return $http.get(`/posts/sorted/user/${uid}/topic/tag/postType/`);
  };

  postFactory.getSortedComments = function(sorting){
    console.log(sorting);
    return $http.get(`/posts/sortedComments/${sorting.sortingMethod}/post/${sorting.pid}`);
  };

  postFactory.getSortedAnswers = function(sorting){
    console.log(sorting);
    return $http.get(`/posts/sortedComments/${sorting.sortingMethod}/post/${sorting.pid}`);
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

  postFactory.formatTags = function(posts){
    posts.map(function(post){
      var formattedTags = "";
      post.tags.forEach(function(tag){
        formattedTags += tag + ", ";
      });
      post.tags = formattedTags;
      return post;
    })
  }

  postFactory.formatUserPosts = function(posts, currentUser){
    posts.map(function(post){
      post.author._id.toString() === currentUser._id.toString() ?  post.userPost = true :  post.userPost = false;
    })
  }

  postFactory.formatPosts = (posts, currentUser) => {
    postFactory.formatLikedPosts(posts, currentUser)
    postFactory.formatUserPosts(posts, currentUser)
    postFactory.formatTags(posts)
    return posts;
  }

  return postFactory;
});
