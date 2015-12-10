;
(function() {
  'use strict';
  angular.module('app.routeInfo', [])
    .controller('RouteInfoController', ['$scope', '$location', 'RouteService', function($scope, $location, RouteService) {
      var vm = this;


      // check if route has been submitted before calculating distance
      if (RouteService.turfLine && RouteService.selectedStart) {
        // vm.shortestDistance = turf.lineDistance(RouteService.resampledRoutes.shortestPath.turfLine).toFixed(2);
        // vm.minElevationDistance = turf.lineDistance(RouteService.resampledRoutes.minElevPath.turfLine).toFixed(2);

        vm.placeNameStart = RouteService.selectedStart.place_name;
        vm.placeNameEnd = RouteService.selectedEnd.place_name;
      }

      $scope.data = RouteService.resampledRoutes;
      var pathTypesRaw = Object.keys(RouteService.resampledRoutes);
      var path_strings = {
        "shortestPath": "Shortest path",
        "minElevPath": "Flattest path",
        "minBiking": "Fastest biking path",
        "minHiking": "Fastest walking path",
        "loop_path": "Running Loop"
      };

      vm.pathTypes = []
      pathTypesRaw.forEach(function(path) {
        vm.pathTypes.push({
          "string": path_strings[path],
          "pathname": path
        });
      })

      vm.displayDirections = function() {
        var path = JSON.parse(vm.directions_path);
        RouteService.getDirections(RouteService.getResampledPath(RouteService.resampledRoutes[path.pathname].turfLine, [], 50).features.map(function(point) {
            return point.geometry.coordinates
          }))
          .then(function(directions) {
            var steps = directions.filter(function(step) {
              return step.search("Reach waypoint") === -1 && step.search("You have arrived at your destination") === -1;
            });
            steps.push("You have arrived at your destination.");

            vm.directions = []
            steps.forEach(function(step, i) {
              vm.directions[i] = {
                "num": (i + 1) + ".",
                "step": step
              }
            })
          })

      }


      vm.createUrl = function() {
        var start = RouteService.selectedStart.center;
        var end = RouteService.selectedEnd.center;
        var prefs = RouteService.routePrefs;

        var link = "?slon=" + start[0] + "&slat=" + start[1] + "&elon=" + end[0] + "&elat=" + end[1];
        for (var pathType in prefs) {
          link += "&" + pathType + "=" + prefs[pathType];
        }
        link = $location.host() + ":" + $location.port() + '/#home/new' + link;
        vm.url = link;
        console.log('link', link);
      }

    }])
})();
