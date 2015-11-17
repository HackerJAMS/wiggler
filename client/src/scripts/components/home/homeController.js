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
            cleanMap();
            // process the coordinates in the path sent from the server routing algorithm
            var coords = res.data.rows;
            for (var i = 0; i < coords.length; i++) {
              i === 0 ? vm.route.push([coords[i].path[0][1], coords[i].path[0][0]]) : true;
              for (var j = 1; j < coords[i].path.length; j++) {
                if (coords[i].path[j][0] !== null) {
                  vm.route.push([coords[i].path[j][1], coords[i].path[j][0]]);
                }
              }
            }
            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.polyline(vm.route, {
              color: 'black'
            }).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

      // this function removes any existing polylines from the map before adding a new one 
      function cleanMap(route) {
        if (polyline) {
          vm.map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline) {
              vm.map.removeLayer(layer);
            }
          })
        }
      }
    }])
})();
