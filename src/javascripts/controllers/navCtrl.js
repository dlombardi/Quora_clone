app.controller('navCtrl', function($scope, $state) {
  $scope.logout = function() {
    $state.go('home');
  };
});
