'use strict';

app.factory('postFactory', function($window, $http, auth){
  var postFactory= {};

  postFactory.createPost = (newPost) => {
    return $http.post('/posts/add', newPost);
  };

  postFactory.deletePost = (pid) => {
    return $http.delete(`/posts/delete/${pid}`);
  };

  postFactory.changeStats = (statObject) => {
    return $http.put('/posts/changeStats', statObject);
  };

  postFactory.getPost = (pid) => {
    return $http.get(`/posts/${pid}`);
  };

  postFactory.editPost = (editObject) => {
    return $http.put('/posts/edit', editObject);
  };

  postFactory.getPostsByTag = (tag) => {
    return $http.get(`/posts/sorted/user/topic/tag/${tag}/postType/`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    })
  };

  postFactory.getPostsByTopic = (topic) => {
    return $http.get(`/posts/sorted/user/topic/${topic}/tag/postType/`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    })
  };

  postFactory.getSortedPosts = (sorting) => {
   return $http.get(`/posts/sorted/${sorting.sortingMethod}/user/topic/tag/postType/${sorting.postType}`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser());
      return posts;
    })
  };

  postFactory.subscriptionsPosts = (uid) => {
    return $http.get(`/posts/sorted/user/${uid}/topic/tag/postType/`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser())
      return posts;
    })
  };

  postFactory.getSortedComments = (sorting) => {
    return $http.get(`/posts/sortedComments/${sorting.sortingMethod}/post/${sorting.pid}`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser())
      return posts;
    })
  };

  postFactory.getSortedAnswers = (sorting) => {
    return $http.get(`/posts/sortedComments/${sorting.sortingMethod}/post/${sorting.pid}`)
    .success(posts => {
      postFactory.formatPosts(posts, auth.currentUser())
      return posts;
    })
  };


  postFactory.formatLikedPosts = (posts, currentUser) => {
    posts.map(post => {
      return post.likers.forEach(liker => {
        if(liker.toString() === currentUser._id.toString()){
          let likedPost = post;
          likedPost.liked = true;
          return likedPost;
        } else {
          return post;
        }
      })
    });
    posts.map(post => {
      return post.dislikers.forEach(disliker => {
        if(disliker.toString() === currentUser._id.toString()){
          let dislikedPost = post;
          dislikedPost.disliked = true;
          return dislikedPost;
        } else {
          return post;
        }
      })
    });
  };

  postFactory.formatTags = (posts) => {
    posts.map(post => {
      console.log(posts);
      var formattedTags = "";
      post.tags.forEach(tag => {
        formattedTags += tag + ", ";
      });
      post.tags = formattedTags;
      return post;
    })
  }

  postFactory.formatUserPosts = function(posts, currentUser){
    posts.map(function(post){
      post.author._id.toString() === currentUser._id.toString() ?  post.userPost = true :  post.userPost = false;
      post.answers.length > 0 ? post.answerWritten = true : post.answerWritten = false;
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
