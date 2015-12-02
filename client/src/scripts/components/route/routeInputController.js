;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$location', '$q', 'RouteService', function($location, $q, RouteService) {
      var vm = this;
      var polyline;
      
      var queryResult;
      vm.autocompleteQuery = function(searchText) {
        var defer = $q.defer();
        RouteService.geocoding(searchText)
          .then(function successCb(res) {
            queryResult = res.data.features;
            defer.resolve(queryResult);
          }, function errorCb(res) {
            console.error("failed to rectrieve coordinates from mapbox...", res);
          });

        return defer.promise;
      };

      vm.flipStartEnd = function() {
        var start = vm.selectedStart;
        var end = vm.selectedEnd;
        vm.selectedStart = end;
        vm.selectedEnd = start;
      };

      vm.submitRoute = function(start, end, prefs) {
        // add default start/end points for testing (215 church to 500 divisadero)
        var start = vm.selectedStart ? vm.selectedStart.center : [-122.428561, 37.767191];
        var end = vm.selectedEnd ? vm.selectedEnd.center : [-122.437364, 37.774222];
        var prefs = '';

        // console.log("start", start, "end", end);
        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            RouteService.cleanMap(polyline !== "undefined", RouteService.map);
            var coords = res.data[0];
            var elevation = res.data[1];
            // path as array of long/lat tuple
            var path = RouteService.getPath(coords);
            // re-format elevation data with turf points
            var elevationCollection = RouteService.getElevationPath(elevation);
            // turf linestring
            RouteService.turfLine = turf.linestring(path);
            // resample turfline for 3d point display

            var resampledPath = RouteService.getResampledPath(RouteService.turfLine, elevationCollection);

            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(RouteService.turfLine, {
              color: 'red'
            }).addTo(RouteService.map);
            RouteService.map.fitBounds(polyline.getBounds());
            // this allows the line and map to load before drawing the path
            var path = angular.element(document.querySelector('path'));
            setTimeout(function() {
              path.css('stroke-dashoffset', 0)
            }, 10);

            // renders the resampledRoute after the elevation data is returned from googleapi:
            L.geoJson(resampledPath, {
              pointToLayer: function(feature, latlng) {
                var roundedElev = feature.properties.elevation.toFixed(2);
                var cssHeight = roundedElev;
                var myIcon = L.divIcon({
                  className: 'elevations',
                  html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
                });
                return L.marker(latlng, {
                  icon: myIcon
                });
              }
            }).addTo(RouteService.map);
            
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };
    }])
})();
