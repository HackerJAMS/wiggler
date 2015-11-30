;
(function() {
  'use strict';
  angular.module('app.map', [])
    .controller('MapController', ['$location','RouteService', function($location, RouteService) {
      var vm = this;
      var polyline;

      vm.callback = function(map) {
        RouteService.map = map;
        vm.map = map;
        map.setView([37.774, -122.496], 13);
      };

      vm.submitRoute = function(start, end, prefs) {
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
            // resample turfline for 3d point display
            var resampledPath = RouteService.getResampledPath(turfLine, elevationCollection);

            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(turfLine, {
              color: 'red'
            }).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());

            // renders the resampledRoute after the elevation data is returned from googleapi:
            L.geoJson(resampledPath, {
              pointToLayer: function(feature, latlng) {
                var roundedElev = feature.properties.elevation.toFixed(2);
                var cssHeight = roundedElev * 4;
                var myIcon = L.divIcon({
                  className: 'markerline',
                  html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
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

      // functions for 3d map rotation

      //scope variables
      vm.angle = 0;
      vm.xdrag = 0;
      vm.isDown = false;
      vm.xpos = 0;

      var mapRot = angular.element(document.querySelector('#maprotor'));
      var mapEl = angular.element(document.querySelector('#map'));

      var tiltCheck= false;

      vm.mouseDown = function(e){
        if (tiltCheck){
          vm.xpos = e.pageX;
          vm.isDown = true;
        }
      }

      vm.mouseMove = function(e){
        if (tiltCheck) {
          if (vm.isDown) {
            var elevMarker = angular.element(document.querySelectorAll('.elevmarker'));
            // console.log(elevMarker);

            vm.xdrag = (vm.xpos - e.pageX) / 4;
            mapEl.attr('style', '-webkit-transform:rotateZ(' + (vm.angle + vm.xdrag) % 360 + 'deg)');
            elevMarker.attr('style', '-webkit-transform:rotateX(90deg) rotateY(' + (vm.angle + vm.xdrag) * (-1) % 360 + 'deg)');
          }
        }
      }

      vm.mouseUp = function(e){
        if (tiltCheck){
          vm.isDown = false;
          vm.angle = vm.angle + vm.xdrag;
        }
      }

      // rotate (tilt) map
      vm.tiltMap = function() {
        // vm.map.fitBounds(vm.map.featureLayer.setGeoJSON(turf.linestring(vm.resampledRoute)).getBounds(), {
        //   paddingTopLeft: [150, 50],
        //   paddingBottomRight: [150, 50]
        // });
        if (tiltCheck) {
          tiltCheck = false;
          mapRot.removeClass("tilted");
          vm.map.dragging.enable(); 
        } else {
          tiltCheck = true;
          vm.map.dragging.disable(); 
          mapRot.addClass("tilted");
        }
      }
    }])
})();
