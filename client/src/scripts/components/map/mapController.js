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
        new L.Control.Zoom({
          position: 'topright'
        }).addTo(map);
        map.scrollWheelZoom.disable();
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
            vm.turfLine = turf.linestring(path);
            // resample turfline for 3d point display
            vm.resampledPath = RouteService.getResampledPath(vm.turfLine, elevationCollection);

            // draw route on the map and fit the bounds of the map viewport to the route
            polyline = L.geoJson(vm.turfLine, {
              color: 'red'
            }).addTo(vm.map);
            vm.map.fitBounds(polyline.getBounds());

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

      vm.tiltCheck= false;
      var elevMarker;
      vm.mouseDown = function(e){
        if (vm.tiltCheck){
          vm.xpos = e.pageX;
          vm.isDown = true;
        }
      }

      vm.mouseMove = function(e){
        if (vm.tiltCheck) {
          if (vm.isDown) {
            elevMarker = angular.element(document.querySelectorAll('.elevmarker'));

            vm.xdrag = (vm.xpos - e.pageX) / 4;
            mapEl.attr('style', '-webkit-transform:rotateZ(' + (vm.angle + vm.xdrag) % 360 + 'deg)');
            elevMarker.attr('style', '-webkit-transform:rotateX(90deg) rotateY(' + (vm.angle + vm.xdrag) * (-1) % 360 + 'deg)');
          }
        }
      }

      vm.mouseUp = function(e){
        if (vm.tiltCheck){
          vm.isDown = false;
          vm.angle = vm.angle + vm.xdrag;
        }
      }

      // rotate (tilt) map
      vm.tiltMap = function() {
        vm.map.fitBounds(vm.map.featureLayer.setGeoJSON(vm.turfLine).getBounds()
        //   , {
        //   paddingTopLeft: [150, 50],
        //   paddingBottomRight: [150, 50]
        // }
        );

        vm.tiltCheck = true;
        vm.map.dragging.disable(); 
        mapRot.addClass("tilted");

        // renders the resampledRoute after the elevation data is returned from googleapi:
        L.geoJson(vm.resampledPath, {
          pointToLayer: function(feature, latlng) {
            var roundedElev = feature.properties.elevation.toFixed(2);
            var cssHeight = roundedElev * 4;
            var myIcon = L.divIcon({
              className: 'elevations',
              html: '<div class="elevmarker"><div class="markercircle bottomcap"></div><div class="markerline" style="height:'
                   + cssHeight + 'px">' + '</div><div class="markercircle"></div><div class="elevfigure">' + 
                   roundedElev + ' ft.</div></div>'
            });
            return L.marker(latlng, {
              icon: myIcon
            });
          }
        }).addTo(vm.map);
      };

      vm.restoreMap = function (){
        elevMarker = angular.element(document.querySelectorAll('.elevmarker'));
        
        mapEl.attr('style', 'transition:all 0.25s');
        elevMarker.attr('style', '');

        vm.tiltCheck = false;
        mapRot.removeClass("tilted");
        vm.map
          .dragging.enable();
        vm.angle = 0;
      };
    }])
})();
