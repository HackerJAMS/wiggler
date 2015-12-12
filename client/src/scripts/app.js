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
    // additional add-ons
    'ngTouch',
    'angularSpinner',
    'ngLoadingSpinner',
    'ngMdIcons',
    'd3',

    //app modules
    'app.header',
    'app.routeService',
    'app.map',
    'app.routeInput',
    'app.routeInfo',
    'app.elevationGraph',
    'app.main'
  ]);


  app.config(['$stateProvider', '$urlRouterProvider', "$mdThemingProvider", function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('pink');  

    $urlRouterProvider
      .otherwise('/home/new');

    $stateProvider
      .state('main', {
        url: '/home',
        views: {
          '': {
            templateUrl: "src/scripts/components/main/main.html"
          },
          "map@main":{
            templateUrl: "src/scripts/components/map/map.html",
            controller: "MapController"
          }
        }
      })
      .state('main.route-input',{
        url: '/new?slon&:slat&elon&elat&shortestPathChecked&minElevPathChecked&minBikingChecked&minHikingChecked&&loopSelected&&loopDistance',
        templateUrl: "src/scripts/components/route/route_input.html"
      })
      .state('main.route-info', {
        url: '/info',
        templateUrl: "src/scripts/components/route/route_info.html"
      })
      .state('about', {
        url: '/about',
        templateUrl: 'src/scripts/components/about/about.html'
      })
  }])

})();


