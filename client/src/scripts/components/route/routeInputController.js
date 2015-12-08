;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$rootScope','$scope', '$location', '$q', 'RouteService', function($rootScope, $scope, $location, $q, RouteService) {
      var vm = this;
      vm.selectedStart;
      vm.selectedEnd;

      var polyline;   

      $rootScope.$on("markerUpdate", function(event, args) {
        vm.selectedStart = {};
        vm.selectedEnd = {};

        var tempCoords = args[0].getLatLng();
        vm.selectedStart.center = [tempCoords.lng, tempCoords.lat];
        vm.selectedStart.place_name = 'Marker Start Position';
        
        if (args[1]) {
          tempCoords = args[1].getLatLng();
          vm.selectedEnd.center = [tempCoords.lng, tempCoords.lat];
          vm.selectedEnd.place_name = 'Marker End Position';
        }
      })

      vm.autocompleteQuery = function(searchText) {
        var defer = $q.defer();
        RouteService.geocoding(searchText)
          .then(function successCb(res) {
            // limit results to only places within san francisco
            var queryResult = turf.within(res.data, RouteService.within);
            defer.resolve(queryResult.features);
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

      vm.getLocation = function() {
        // get user location coordinates via HTML5 geolocator
        if (!localStorage['userCoords']) {
          navigator.geolocation.getCurrentPosition(function successCb(position) {
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;
            var userCoords = [userLng, userLat];
            RouteService.currentPosition = userCoords;
            //saves user location coordinates in local storage
            localStorage['userCoords'] = JSON.stringify(userCoords);

          }, function errorCb(err) {
            console.warn('geolocation error');
          });
        }
        //retrieves coordinates from local storage 
        RouteService.currentPosition = JSON.parse(localStorage['userCoords']);

        vm.selectedStart = {};
        vm.selectedStart.center = RouteService.currentPosition;
        vm.selectedStart.place_name = 'Current Position';
      };

      vm.submitRoute = function(start, end, prefs) {
        // set default route for testing -- 'the wiggle'
        if (!vm.selectedStart) {
          vm.selectedStart = {
            place_name: '215 Church St, San Francisco, California 94114, United States',
            center: [-122.428561, 37.767191]
          }
          vm.selectedEnd = {
            place_name: '500 Divisadero St, San Francisco, California 94117, United States',
            center: [-122.437364, 37.774222]
          }
        }

        // start and end coordinates
        var start = vm.selectedStart.center;
        var end = vm.selectedEnd.center;

        // store start/end address for route info display
        RouteService.placeNameStart = vm.selectedStart.place_name;
        RouteService.placeNameEnd = vm.selectedEnd.place_name;

        var prefs = {};
        prefs.shortestPathChecked = vm.shortestPathChecked;
        prefs.minElevPathChecked = vm.minElevPathChecked;
        prefs.minBikingChecked = vm.minBikingChecked;
        prefs.minHikingChecked = vm.minHikingChecked;
        RouteService.routePrefs = prefs;

        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            res.start = start;
            res.end = end;
            RouteService.routeData = res;

       // $scope.$watch(function() {return RouteService.routeData}, function(newData, oldData) {

       //    if (newData !== oldData) {
            // console.log('newData',newData,'oldData',oldData);
            RouteService.cleanMap(polyline !== "undefined", RouteService.map);
            RouteService.addStartEndMarkers(start, end);
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
            RouteService.featureLayer = L.mapbox.featureLayer(turfLines);
            RouteService.map.fitBounds(RouteService.featureLayer.getBounds());
            RouteService.addLegend(RouteService.routePrefs);        
        //   }

        // });

          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

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

        // broadcast elevationCollection to d3 controller
        // test with minElevationPath
        if (pathType === 'minElevPath') {
          $scope.$broadcast('init2DGraph', resampledPath);
        }
  
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
      }      

    }])
})();
