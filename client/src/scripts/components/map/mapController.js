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
            console.log(elevation, coords);
            // path as array of long/lat tuple
            var path = RouteService.getPath(coords);
            // re-format elevation data with turf points
            var elevationCollection = RouteService.getElevationPath(elevation);
            // turf linestring
            var turfLine = turf.linestring(path);
            // turf collection with elevation data
            var turfElevation = turf.featurecollection(elevationCollection);
            console.log('geo JSON data---->', JSON.stringify(elevationCollection));
            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(turfLine, {color : 'red'}).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());

            // draw elevation points
            L.geoJson(elevationCollection, {
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

//##########################################################

    // var resample = function(line, interval, unit) {
    //   var features = [];
    //   var interval = interval;
    //   features.push(line);
    //   //with hard coded interval values, 42 is the amount we can fit in the current path--fix this
    //   for (var i = 0; i < 35; i++) {
    //     var point = turf.along(line, interval, unit);
    //     // console.log(point.geometry.coordinates);
    //     var pointCoords = point.geometry.coordinates;
    //     // console.log("----------------------------->>>>>>",pointCoords);
    //     features.push(point);
    //     interval = interval + 0.01;
    //   }
    //   return features;
    // }

    // // var myFeatures = resample(myLine, 0.01, 'miles');
    // //send the coordinates of new points to google elevation api
    // var coordsToSend = myFeatures.slice();
    // coordsToSend.shift();

    // var sampledPointCoordinates = coordsToSend.map(function(n, i) {
    //   return n.geometry.coordinates;
    // });
    // //send to googleapi:
    // // RouteService.postRouteRequest(sampledPointCoordinates)
    // //   .then(function successCb(res){
    // //     console.log(res)
    // //   }, function errorCb(res){
    // //     console.log('error in elevation request', res.status);
    // // });

    // var resampledRoute = {
    //   "type": "FeatureCollection",
    //   "features": myFeatures
    // };

    // L.geoJson(resampledRoute).addTo(vm.map);

    //renders the resampledRoute after the elevation data is returned from googleapi:

    // L.geoJson(turfElevation, {
    //   pointToLayer: function(feature, latlng) {
    //     var myIcon = L.divIcon({
    //       className: 'markerline',
    //       html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + feature.properties.elevation * 20 + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure"><strong>' + (feature.properties.elevation * 3.28).toFixed(0) + ' ft </strong><span style="font-size:0.9em"></span></div>'
    //     });
    //     // return L.circleMarker(latlng, {radius: feature.properties.elevation*10});
    //     return L.marker(latlng, {
    //       icon: myIcon
    //     });
    //   }
    // }).addTo(vm.map);

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
