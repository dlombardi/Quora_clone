'use strict';

app.factory('postFactory', function($window, $http){
  var postFactory= {};

  postFactory.createPost = function(newPost) {
    return $http.post('/api/posts/add', newPost);
  };

  postFactory.deletePost = function(pid){
    return $http.delete('/api/posts/delete', pid);
  };

  postFactory.changeStats = function(statObject){
    return $http.put('/api/posts/changeStats', statObject);
  };

  postFactory.editPost = function(editObject){
    return $http.put('/api/posts/edit', editObject);
  };

  postFactory.getPostsByTag = function(tag){
    return $http.get('/api/posts/sorted/user/topic/tag/'+ tag +'/postType/');
  };

  postFactory.getPostsByTopic = function(topic){
    return $http.get('/api/posts/sorted/user/topic/'+ topic +'/tag/postType/');
  };

  postFactory.getSortedPosts = function(sorting){
    return $http.get('/api/posts/sorted/'+sorting.sortingMethod+'/user/topic/tag/postType/'+ sorting.postType +'');
  };

  postFactory.getSortedComments = function(sorting){
    console.log(sorting);
    return $http.get('/api/posts/sortedComments/'+sorting.sortingMethod+'/post/'+sorting.pid+'');
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



// $http({
//   method: 'GET',
//   url: '/topics'
// }).then(function(data){
//   var specialdata = [{myButt: 'data'}, {myButt: 'butt'}, {myButt: 'rocks'}, {myButt: 'salt'}, {myButt: 'bathsalt'}];
//   $scope.topics = specialdata;
// }).catch(function(err){
//   console.error('errthang is wrong.', err, status);
// });
