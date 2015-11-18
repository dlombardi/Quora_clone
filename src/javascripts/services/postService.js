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
           console.log("inside if statement" , post);
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
