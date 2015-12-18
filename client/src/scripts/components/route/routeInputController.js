;
(function() {
  'use strict';
  angular.module('app.routeInput', [])

  .controller('RouteInputController', ['$stateParams', '$rootScope', '$scope', '$location', '$q', 'RouteService', '$mdSidenav', function($stateParams, $rootScope, $scope, $location, $q, RouteService, $mdSidenav) {

    var vm = this;

    var polyline;

    $rootScope.$on("markerUpdate", function(event, args) {
      var tempCoords = args[0].getLatLng();
      RouteService.geocoding(tempCoords.lng, tempCoords.lat)
        .then(function successCb(res) {
          vm.selectedStart = res.data.features[0];
          vm.loopStart = res.data.features[0];
        }, function errorCb(res) {
          console.log("error geocoding click marker location", res);
        });

      if (args[1] !== undefined) {
        tempCoords = args[1].getLatLng();
        RouteService.geocoding(tempCoords.lng, tempCoords.lat)
          .then(function successCb(res) {
            vm.selectedEnd = res.data.features[0];
          }, function errorCb(res) {
            console.log("error geocoding click marker location", res);
          });
      }
    })

    vm.closeSideNavPanel = function() {
      $mdSidenav('left').close();
    }

    vm.autocompleteQuery = function(searchText) {
      var defer = $q.defer();
      RouteService.reverseGeocoding(searchText)
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
      }
      if (!vm.selectedEnd) {
        vm.selectedEnd = {
          place_name: '500 Divisadero St, San Francisco, California 94117, United States',
          center: [-122.437364, 37.774222]
        }
      }

      // start and end coordinates
      var start = vm.selectedStart.center;
      var end = vm.selectedEnd.center;

      // store start/end address for route info display
      RouteService.selectedStart = vm.selectedStart;
      RouteService.selectedEnd = vm.selectedEnd;

      var prefs = {};
      prefs.shortestPathChecked = vm.shortestPathChecked;
      prefs.minElevPathChecked = vm.minElevPathChecked;
      prefs.minBikingChecked = vm.minBikingChecked;
      prefs.minHikingChecked = vm.minHikingChecked;
      RouteService.routePrefs = prefs;
      RouteService.resampledRoutes = {};
    
      RouteService.postRouteRequest(start, end, prefs)
        .then(function successCb(res) {
          res.start = start;
          res.end = end;

          RouteService.routeData = res;

          RouteService.cleanMap(polyline !== "undefined", RouteService.map);
          RouteService.addStartEndMarkers(start, end);
          // turfLines store the returned routes and are added to featureLayer
          var turfLines = {};
          turfLines.type = 'FeatureCollection';
          turfLines.features = [];
          for (var pathType in RouteService.routeData.data) {
            if (res.data[pathType][1].length ===0){
              alert("Sorry! We've gone over our google API request limit for the day... Come back tomorrow!")
              return;
            }
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

    vm.submitLoopRoute = function(start, distance) {
      start = vm.loopStart || {
        place_name: '215 Church St, San Francisco, California 94114, United States',
        center: [-122.428561, 37.767191]
      };
      RouteService.resampledRoutes = {};
      RouteService.loopStart = vm.loopStart;
      RouteService.routePrefs = {};
      RouteService.routePrefs.loopSelected = true;
      // approx loop distance in miles
      distance = vm.loopDistance || 3;
      RouteService.inputLoopDistance = vm.loopDistance;    
      RouteService.postLoopRequest(start, distance)
        .then(function successCb(res) {
          if (res.data["loop_path"][1].length ===0 ){
            alert("Sorry! We've gone over our google API request limit for the day... Come back tomorrow!")
            return;
          }
          RouteService.routeData = res;
          RouteService.cleanMap();
          RouteService.addStartEndMarkers(start.center);

          var turfLines = {};
          turfLines.type = 'FeatureCollection';
          turfLines.features = [];
          var coords = res.data["loop_path"][0];
          var elevation = res.data["loop_path"][1];
          plotRoute(coords, elevation, "loop_path", turfLines);
          RouteService.featureLayer = L.mapbox.featureLayer(turfLines);
          RouteService.loopDistance = turf.lineDistance(RouteService.turfLine, 'miles');
          RouteService.map.fitBounds(RouteService.featureLayer.getBounds());
        }, function errorCb(res) {
          console.log("error", res)
        })
    }

    // plot 2D routes and 3D markers on the map
    var plotRoute = function(coords, elevation, pathType, turfLines) {
      // path as array of long/lat tuple
      var path = RouteService.getPath(coords);
      // turf linestring
      RouteService.turfLine = turf.linestring(path);
      // turfLines will be added to featureLayer
      turfLines.features.push(RouteService.turfLine);
      // re-format elevation data with turf points
      var elevationCollection = RouteService.getElevationPath(elevation);

      // resample turfline for 3d point display
      var resampledPath = RouteService.getResampledPath(RouteService.turfLine, elevationCollection);
      RouteService.resampledRoutes[pathType] = {
        'turfLine': RouteService.turfLine,
        'resampledPath': resampledPath
      };

      // draw route on the map and fit the bounds of the map viewport to the route
      var polyline = L.geoJson(RouteService.turfLine, {
        className: 'route-' + pathType
      }).addTo(RouteService.map);

      // this allows the line and map to load before drawing the path
      var path = angular.element(document.querySelectorAll('path.route-' + pathType));
      setTimeout(function() {
        path.css('stroke-dashoffset', 0)
      }, 10);
      
      var newPoints = resampledPath.features.slice();
      var newPointCoordinates = newPoints.map(function(n, i) {
             return n.geometry.coordinates;
          });

      RouteService.postElevationRequest(newPointCoordinates)
      .then(function successCb(res){
         var resampledPoints = RouteService.getElevationPath(res.data);
         RouteService.resampledRoutes[pathType].resampledPath = resampledPoints;
         var uniqueArr = resampledPoints.features;
         var nonUniqueArr = resampledPath.features;

           L.geoJson(resampledPoints, {
           pointToLayer: function(feature, latlng) {
             var roundedElev = (feature.properties.elevation*3.28084).toFixed(2);
             var cssHeight = roundedElev/3.28084;
             var myIcon = L.divIcon({
               className: 'elevations',
               html: '<div class="elevmarker"><div class="markercircle bottomcap marker-' + pathType + '"></div><div class="markerline marker-' + pathType + '" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle marker-' + pathType + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
             });
             return L.marker(latlng, {
               icon: myIcon
             });
           }
         }).addTo(RouteService.map);
      }, function errorCb(res){
         console.log('error in elevation request', res.status);
         // if there's an error with the google request, just use our original elevation values
         L.geoJson(resampledPath, {
           pointToLayer: function(feature, latlng) {
             //convert to feet
             var roundedElev = feature.properties.elevation.toFixed(2)*3.28084;
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
      });

      //clear out currentPosition
      RouteService.currentPosition = null;
    }

    // keep the input fields after clicking on info tab
    if (RouteService.selectedStart && RouteService.selectedEnd) {
      vm.selectedStart = RouteService.selectedStart;
      vm.selectedEnd = RouteService.selectedEnd;
    }

    if (RouteService.loopStart && RouteService.loopDistance) {
      vm.loopStart = RouteService.loopStart;
      vm.loopDistance = RouteService.inputLoopDistance;
    }

    if ($stateParams.loopSelected) {
      RouteService.geocoding($stateParams.slon, $stateParams.slat)
        .then(function successCb(res) {
          // limit results to only places within san francisco
          vm.loopStart = res.data.features[0];
          vm.loopDistance = $stateParams.loopDistance;
          vm.submitLoopRoute();
          // console.log('res', res.data.features[0].place_name);
        }, function errorCb(res) {
          console.error("failed to rectrieve address from mapbox...", res);
        });
    }
    if ($stateParams.shortestPathChecked || $stateParams.minElevPathChecked || $stateParams.minBikingChecked || $stateParams.minHikingChecked) {
      // when use shared url, path selections are initialized below
      vm.shortestPathChecked = JSON.parse($stateParams.shortestPathChecked);
      vm.minElevPathChecked = JSON.parse($stateParams.minElevPathChecked);
      vm.minBikingChecked = JSON.parse($stateParams.minBikingChecked);
      vm.minHikingChecked = JSON.parse($stateParams.minHikingChecked);
      var quriesdone = 0;
      RouteService.geocoding($stateParams.slon, $stateParams.slat)
        .then(function successCb(res) {
          // limit results to only places within san francisco
          vm.selectedStart = res.data.features[0];
          RouteService.selectedStart = vm.selectedStart;
          quriesdone++;
          if (quriesdone == 2) {
            vm.submitRoute();
          }
          // console.log('res', res.data.features[0].place_name);
        }, function errorCb(res) {
          console.error("failed to rectrieve address from mapbox...", res);
        });

      RouteService.geocoding($stateParams.elon, $stateParams.elat)
        .then(function successCb(res) {
          // limit results to only places within san francisco
          vm.selectedEnd = res.data.features[0];
          RouteService.selectedEnd = vm.selectedEnd;
          quriesdone++;
          if (quriesdone == 2) {
            vm.submitRoute();
          }          
          // console.log('res', res.data.features[0].place_name);
        }, function errorCb(res) {
          console.error("failed to rectrieve address from mapbox...", res);
        });

    };

    // initialize the path selectionsf
    vm.initPathSelection = function() {
      // keep selection unchanged when clicking on other tabs
      if (RouteService.routePrefs) {
        vm.shortestPathChecked = RouteService.routePrefs.shortestPathChecked;
        vm.minElevPathChecked = RouteService.routePrefs.minElevPathChecked;
        vm.minBikingChecked = RouteService.routePrefs.minBikingChecked;
        vm.minHikingChecked = RouteService.routePrefs.minHikingChecked;
      }
      // when use shared url, path selections are not undefined
      // when enter the website on normal mode, path selections are set to default values
      if (vm.shortestPathChecked === undefined) {
        vm.shortestPathChecked = true;
        vm.minElevPathChecked = true;
        vm.minBikingChecked = false;
        vm.minHikingChecked = false;
      }    
    }
  }])
})();
