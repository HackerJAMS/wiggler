;
(function() {
  'use strict';
  var app = angular.module('app', [
    'ui.router',
    'app.home'
  ]);

  // app.controller('MainController', function($scope) {
  //     $scope.message = 'Angular Works!'
  // });

  app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'src/scripts/components/home/home.html',
        controller: "HomeController"
      })
  }])

})();
