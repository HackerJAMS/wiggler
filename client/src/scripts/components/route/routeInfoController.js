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

      vm.displayDirections = function(pathType) {
        RouteService.getDirections(RouteService.getResampledPath(RouteService.turfLine, [], 50).features.map(function(point) {
            return point.geometry.coordinates
          }))
          .then(function(directions) {
            var steps = directions.filter(function(step) {
              return step.search("Reach waypoint") === -1 && step.search("You have arrived at your destination") === -1;
            });
            steps.push("You have arrived at your destination.");

            console.log(steps);
          })

      }

      vm.displayDirections("minElevPath");


    }])
})();
