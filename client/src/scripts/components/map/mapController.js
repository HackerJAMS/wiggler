;
(function() {
  'use strict';
  angular.module('app.map', [])
    .controller('MapController', ['$scope', '$location', 'RouteService', function($scope, $location, RouteService, usSpinnerService) {
      var vm = this;
      var polyline;
      var featureLayer;
      // functions for 3d map rotation
      vm.angle = 0;
      vm.xdrag = 0;
      vm.isDown = false;
      vm.xpos = 0;

      var mapRot = angular.element(document.querySelector('#maprotor'));
      var mapEl = angular.element(document.querySelector('#map'));

      vm.tiltCheck = false;

      vm.mouseDown = function(e) {
        if (vm.tiltCheck) {
          vm.xpos = e.pageX;
          vm.isDown = true;
        }
      }

      vm.mouseMove = function(e) {
        if (vm.tiltCheck) {
          if (vm.isDown) {
            var elevMarker = angular.element(document.querySelectorAll('.elevmarker'));

            vm.xdrag = (vm.xpos - e.pageX) / 4;
            mapEl.attr('style', '-webkit-transform:rotateZ(' + (vm.angle + vm.xdrag) % 360 + 'deg)');
            elevMarker.attr('style', '-webkit-transform:rotateX(90deg) rotateY(' + (vm.angle + vm.xdrag) * (-1) % 360 + 'deg)');
          }
        }
      }

      vm.mouseUp = function(e) {
        if (vm.tiltCheck) {
          vm.isDown = false;
          vm.angle = vm.angle + vm.xdrag;
        }
      }

      // rotate (tilt) map
      vm.tiltMap = function() {
        if (RouteService.turfLine) {
          RouteService.map.fitBounds(RouteService.map.featureLayer.setGeoJSON(RouteService.turfLine).getBounds(), {
            paddingTopLeft: [150, 50],
            paddingBottomRight: [150, 50]
          });
        }

        vm.tiltCheck = true;
        RouteService.map.dragging.disable();
        mapRot.addClass("tilted");
      };

      vm.restoreMap = function() {
        var elevMarker = angular.element(document.querySelectorAll('.elevmarker'));
        var path = angular.element(document.querySelector('path'));

        mapEl.attr('style', 'transition:all 0.25s');
        elevMarker.attr('style', '');
        // path.css('stroke-dashoffset', 0)

        vm.tiltCheck = false;
        mapRot.removeClass("tilted");
        RouteService.map.dragging.enable();
        vm.angle = 0;
        RouteService.map.fitBounds(featureLayer.getBounds());

      };

      // watch the change of RouteService.routeData
      $scope.$watch(function() {return RouteService.routeData}, function(newData, oldData) {

        if (newData !== oldData) {
          RouteService.cleanMap(polyline !== "undefined", RouteService.map);
          // turfLines store the returned routes and are added to featureLayer
          var turfLines = {};
          turfLines.type = 'FeatureCollection';
          turfLines.features = [];
          for (var pathType in RouteService.routeData.data) {
            var coords = RouteService.routeData.data[pathType][0];
            var elevation = RouteService.routeData.data[pathType][1];
            plotRoute(coords, elevation, pathType, turfLines);
          }
         // add turfLines to featureLayer and fit map to the bounds
         featureLayer = L.mapbox.featureLayer(turfLines);
         RouteService.map.fitBounds(featureLayer.getBounds());
         RouteService.addLegend(RouteService.routePrefs);
        }

      });

      // plot 2D routes and 3D markers on the map
      var plotRoute = function(coords, elevation, pathType, turfLines) {
        // path as array of long/lat tuple
        var path = RouteService.getPath(coords);
        // turf linestring
        RouteService.turfLine = turf.linestring(path);
        RouteService[pathType] = {
          'turfLine': RouteService.turfLine
        };
        // turfLines will be added to featureLayer
        turfLines.features.push(RouteService.turfLine);        
        // re-format elevation data with turf points
        var elevationCollection = RouteService.getElevationPath(elevation);

        // resample turfline for 3d point display
        var resampledPath = RouteService.getResampledPath(RouteService.turfLine, elevationCollection);
   
//************* calls googleapi for refined elevation data *************

       // var newPoints = resampledPath.features.slice();
       // var newPointCoordinates = newPoints.map(function(n, i) {
       //        return n.geometry.coordinates;
       //     });

       // RouteService.postElevationRequest(newPointCoordinates)
       // .then(function successCb(res){
       //    var resampledPoints = RouteService.getElevationPath(res.data);
       //   //test for unique values; refactor for jasmine test

       //    var uniqueArr = resampledPoints.features;
       //    var nonUniqueArr = resampledPath.features;
       //    uniqueArr.forEach(function(feature){
       //      console.log(feature.properties.elevation);
       //  });

            
       //      L.geoJson(resampledPoints, {
       //      pointToLayer: function(feature, latlng) {
       //        var roundedElev = feature.properties.elevation.toFixed(2);
       //        var cssHeight = roundedElev;
       //        var myIcon = L.divIcon({
       //          className: 'elevations',
       //          html: '<div class="elevmarker"><div class="markercircle bottomcap marker-' + pathType + '"></div><div class="markerline marker-' + pathType + '" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle marker-' + pathType + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
       //        });
       //        return L.marker(latlng, {
       //          icon: myIcon
       //        });
       //      }
       //    }).addTo(RouteService.map);
       // }, function errorCb(res){
       //    console.log('error in elevation request', res.status);
       // });
       
//**************************************
  
        // draw route on the map and fit the bounds of the map viewport to the route

        var polyline = L.geoJson(RouteService.turfLine, {
          className: 'route-' + pathType
        }).addTo(RouteService.map);

        // this allows the line and map to load before drawing the path
        var path = angular.element(document.querySelectorAll('path.route-' + pathType));
        setTimeout(function() {
          path.css('stroke-dashoffset', 0)
        }, 10);
   
        L.geoJson(resampledPath, {
          pointToLayer: function(feature, latlng) {
            var roundedElev = feature.properties.elevation.toFixed(2);
            var cssHeight = roundedElev;
            var myIcon = L.divIcon({
              className: 'elevations',
              html: '<div class="elevmarker"><div class="markercircle bottomcap marker-' + pathType + '"></div><div class="markerline marker-' + pathType + '" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle marker-' + pathType + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
            });
            return L.marker(latlng, {
              icon: myIcon
            });
          }
        }).addTo(RouteService.map);
        
        //clear out currentPosition
        RouteService.currentPosition = null;
      };

    }])
})();
