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
    $urlRouterProvider.otherwise('/home/new');

    $stateProvider
      .state('main', {
        url: '/home',
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
          }
        }
      })
      .state('main.route-input',{
        url: '/new',
        templateUrl: "src/scripts/components/route/route_input.html"
      })
      .state('main.route-output', {
        url: '/info',
        templateUrl: "src/scripts/components/route/route_output.html"
      })
  }])

})();


