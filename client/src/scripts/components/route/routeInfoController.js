;
(function() {
  'use strict';
  angular.module('app.routeInfo', [])
    .controller('RouteInfoController', ['$scope', '$location', 'RouteService', function($scope, $location, RouteService) {
      var vm = this;


      // check if route has been submitted before calculating distance
      if (RouteService.turfLine && RouteService.selectedStart) {
        vm.placeNameStart = RouteService.selectedStart.place_name;
        vm.placeNameEnd = RouteService.selectedEnd.place_name;
      }

      if (RouteService.resampledRoutes["loop_path"]){
        vm.loopStart = RouteService.loopStart.place_name;
        vm.loopDistance = Math.round(RouteService.loopDistance *100)/100 + " miles";
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
              return step.maneuver.search("Reach waypoint") === -1 && step.maneuver.search("You have arrived at your destination") === -1;
            });
            steps.push({maneuver: "You have arrived at your destination.", distance:5});
            vm.directions = []
            steps.forEach(function(step, i) {
              if (step.maneuver) {
                vm.directions[i] = {
                  "num": (i + 1) + ".",
                  "step": step.maneuver,
                  "distance": Math.round(step.distance * 3.28084) + "ft"
                }
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
