;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$location', 'RouteService', function($location, RouteService) {
      var vm = this;
      var polyline;

      vm.callback = function(map) {
        vm.map = map;
        map.setView([37.773, -122.446], 13);
      };
 
      var queryResult;
      vm.autocompleteQuery = function(searchText) {
        console.log('address:', searchText);
        
        RouteService.geocoding(searchText)
          .then(function successCb(res) {
            console.log('res', res.data.features);
            queryResult = res.data.features;
          }, function errorCb(res) {
            console.error("failed to rectrieve coordinates from mapbox...", res);
          });
        
        return queryResult;
      };

      vm.submitRoute = function() {

        var prevPoint, nextPoint, incrementDist = 5;
        var start = vm.selectedStart.center;
        var end = vm.selectedEnd.center;
        var prefs = '';
        console.log("start", vm.selectedStart, "end", vm.selectedEnd);
        vm.route = [];
        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            RouteService.cleanMap(polyline !== "undefined", vm.map);
            var coords = res.data[0];
            var elevation = res.data[1];
            vm.route = RouteService.getPath(coords);

            elevation.forEach(function(n, i) {
              var pointGrade = '';
              if (i > 0 && i < elevation.length - 1) {
                prevPoint = elevation[i - 1].elevation;
                nextPoint = elevation[i + 1].elevation;

                pointGrade = '(' + (100 * 0.5 * ((n.elevation - prevPoint) + (nextPoint - n.elevation)) / incrementDist).toFixed(0) + '% grade)';
              }
              var myIcon = L.divIcon({
                className: 'elevations',
                html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + n.elevation * 5 + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure"><strong>' + (n.elevation * 3.28).toFixed(0) + ' ft </strong><span style="font-size:0.9em">' + pointGrade + '</span></div>'
              });
              L.marker([n.location.lat, n.location.lng], {
                icon: myIcon
              }).addTo(vm.map);

            })

            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.polyline(vm.route).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

      // rotate (tilt) map
      vm.rotateMap = function() {
        $('body').toggleClass('rotated');
      }
    }])
})();