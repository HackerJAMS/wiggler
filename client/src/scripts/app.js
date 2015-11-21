;
(function() {
  'use strict';
  var app = angular.module('app', [
    'ui.router',
    'app.map'
  ]);

  // app.controller('MainController', function($scope) {
  //     $scope.message = 'Angular Works!'
  // });

  app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('main', {
        url: '/',
        views: {
          "main": {
            templateUrl: "src/scripts/components/main/main.html"
          },
          "map@main":{
            templateUrl: "src/scripts/components/map/map.html",
            controller: "MapController"
          },
          "header@main": {
            templateUrl: "src/scripts/components/header/header.html"
          },
          "route_input@main":{
            templateUrl: "src/scripts/components/route_input/route_input.html"
          }
        }
      })
  }])

})();


