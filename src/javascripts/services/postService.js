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

  postFactory.getSortedAnswers = function(sorting){
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
