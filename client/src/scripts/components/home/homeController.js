;
(function() {
  'use strict';
  angular.module('app.home', [])
    .controller('HomeController', ['$location', 'RouteService', function($location, RouteService) {
      var vm = this;
      var polyline;

      vm.callback = function(map) {
        vm.map = map;
        map.setView([37.773, -122.446], 13);
      };

      vm.submitRoute = function(start, end, prefs) {
        vm.route = [];
        RouteService.postRouteRequest(start, end, prefs)
        .then(function successCb(res) {
          RouteService.cleanMap(polyline !== "undefined", vm.map);
          var coords = res.data;
          vm.route = RouteService.getPath(coords);

          // draw route on the map and fit the bounds of the map viewport to the route
          polyline = L.polyline(vm.route).addTo(vm.map);
          vm.map.fitBounds(polyline.getBounds());
        }, function errorCb(res) {
          console.log("error posting route request", res.status);
        });
      };
    }])
})();
