;
(function() {
  'use strict';
  angular.module('app.map', [])
    .controller('MapController', ['$location', 'RouteService', function($location, RouteService) {
      var vm = this;
      var polyline;

      vm.callback = function(map) {
        vm.map = map;
        map.setView([37.773, -122.446], 13);
      };

      vm.submitRoute = function(start, end, prefs) {

        var prevPoint, nextPoint, incrementDist = 5;

        vm.route = [];
        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            RouteService.cleanMap(polyline !== "undefined", vm.map);
            var coords = res.data[0];
            var elevation = res.data[1];
            // path as array of long/lat tuple
            var path = RouteService.getPath(coords);
            // re-format elevation data with turf points
            var elevationCollection = RouteService.getElevationPath(elevation);
            // turf linestring
            var turfLine = turf.linestring(path);
            // turf collection with elevation data
            var turfElevation = turf.featurecollection(elevationCollection);

            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(turfLine).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());

            // draw elevation points
            L.geoJson(turfElevation, {
              pointToLayer: function(feature, latlng) {
                var myIcon = L.divIcon({
                  className: 'markerline',
                  html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + feature.properties.elevation * 20 + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure"><strong>' + (feature.properties.elevation * 3.28).toFixed(0) + ' ft </strong><span style="font-size:0.9em"></span></div>'
                });
                return L.marker(latlng, {
                  icon: myIcon
                });
              }
            }).addTo(vm.map);
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
