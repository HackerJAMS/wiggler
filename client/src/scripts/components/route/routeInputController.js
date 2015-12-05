;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$location', '$q', 'RouteService', function($location, $q, RouteService) {
      var vm = this;
      var polyline;
      var queryResult;
      var currentPosition;
      // turfLines store the returned routes and are added to featureLayer
      var turfLines = {};
      turfLines.type = 'FeatureCollection';
      turfLines.features = [];
      
      vm.autocompleteQuery = function(searchText) {
        var defer = $q.defer();
        RouteService.geocoding(searchText)
          .then(function successCb(res) {
            // limit results to only places within san francisco
            queryResult = turf.within(res.data, RouteService.within);
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
            currentPosition = userCoords;
            //saves user location coordinates in local storage
            localStorage['userCoords'] = JSON.stringify(userCoords);

          }, function errorCb(err) {
            console.warn('geolocation error');
          });
        }
        //retrieves coordinates from local storage 
        currentPosition = JSON.parse(localStorage['userCoords']);

        vm.selectedStart = {};
        vm.selectedStart.center = currentPosition;
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
        var locationsGeojson = [];
        locationsGeojson.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-122.437364, 37.774222]
          },
          "properties": {
            "marker-color": "#DC3C05",
            "marker-size": "large",
            "marker-symbol": "star"
          }
        });
        L.mapbox.featureLayer(locationsGeojson).addTo(RouteService.map);

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

        RouteService.cleanMap(polyline !== "undefined", RouteService.map);
        turfLines.features = [];

        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            RouteService.addLegend(prefs);
            for (var pathType in res.data) {
              var coords = res.data[pathType][0];
              var elevation = res.data[pathType][1];
              plotRoute(coords, elevation, pathType);
            }

           // add turfLines to featureLayer and fit map to the bounds
           var featureLayer = L.mapbox.featureLayer(turfLines);
           RouteService.map.fitBounds(featureLayer.getBounds());
 
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

      var plotRoute = function(coords, elevation, pathType) {
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

        polyline = L.geoJson(RouteService.turfLine, {
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
        currentPosition = null;
      };
    }])
})();