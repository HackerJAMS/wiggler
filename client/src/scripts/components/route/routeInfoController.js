;
(function() {
  'use strict';
  angular.module('app.routeInfo', [])
    .controller('RouteInfoController', ['RouteService', function(RouteService) {
      var vm = this;

      // check if route has been submitted before calculating distance
      if (RouteService.turfLine) {
        vm.shortestDistance = turf.lineDistance(RouteService.shortestPath.turfLine).toFixed(2);
        vm.minElevationDistance = turf.lineDistance(RouteService.minElevPath.turfLine).toFixed(2);
        vm.placeNameStart = RouteService.placeNameStart;
        vm.placeNameEnd = RouteService.placeNameEnd;
      }
    }])
})();
