;
(function() {
  'use strict';
  angular.module('app.routeInfo', [])
    .controller('RouteInfoController', ['RouteService', function(RouteService) {
      var vm = this;

      // check if route has been submitted before calculating distance
      if (RouteService.turfLine) {
        vm.distance = turf.lineDistance(RouteService.turfLine).toFixed(2);
      }
    }])
})();
