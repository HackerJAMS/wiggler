;
(function() {
  'use strict';
  var app = angular.module('app', [
    // ng material dependencies
    'ngMaterial',
    'ngAnimate',
    'ngAria',
    // router
    'ui.router',

    //app modules
    'app.routeService',
    'app.map',
    'app.routeInput',
    'angularSpinner',
    'ngLoadingSpinner'
  ]);


  app.config(['$stateProvider', '$urlRouterProvider', "$mdThemingProvider", function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
    // $mdThemingProvider.theme('default')
    //     .primaryPalette('cyan')
    //     .accentPalette('blue-grey');  
    

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


