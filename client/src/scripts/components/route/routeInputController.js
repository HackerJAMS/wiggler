;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$location', '$q', 'RouteService', function($location, $q, RouteService) {
      var vm = this;
      var polyline;
      var queryResult;
      var currentPosition;
    
    
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

      vm.getLocation = function(){

        console.log('in location');
        if(!navigator.geolocation){
          alert('Geolocation is not available on this browser!');
        } else {
          navigator.geolocation.getCurrentPosition(function successCb(position){
            //draw marker on map
            var userLat = position.coords.latitude;
            var userLng = position.coords.longitude;
            var userCoords = [userLng, userLat];
            currentPosition = userCoords;
            
            RouteService.getLocationAddress(currentPosition)
              .then(function successCb(res){
                var userCurrentLocation = res.data.features[0].place_name;
                vm.selectedStart = userCurrentLocation;
              }, function errorCb(err){
                console.log('error!!')
              });

            var geojsonMarkerOptions = {
              radius: 8,
              fillColor: "#ff7800",
              color: "#000",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            };

            var userLocation = {
              "type" : "Feature", 
              "properties" : {
                "name" : "mylocation"
              },
              "geometry" : {
                "type" : "Point",
                "coordinates" : userCoords
              }
            }
      
            L.geoJson(userLocation, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(RouteService.map);
       
            
          }, function errorCb(err){
            console.warn('geolocation error');
          });
        }
      };

      vm.submitRoute = function(start, end, prefs) {

        // add default start/end points for testing (215 church to 500 divisadero)
        var start = vm.selectedStart ? vm.selectedStart.center : [-122.428561, 37.767191];
        var end = vm.selectedEnd ? vm.selectedEnd.center : [-122.437364, 37.774222];
        var prefs = {};
        prefs.shortestPathChecked = vm.shortestPathChecked;
        prefs.minElevPathChecked = vm.minElevPathChecked; 
        
        console.log("shortestPathChecked", prefs.shortestPathChecked);
        console.log("minElevPathChecked", prefs.minElevPathChecked);       
        // console.log("start", start, "end", end);
        if(currentPosition){
          start = currentPosition;
        }

        RouteService.postRouteRequest(start, end, prefs)
          .then(function successCb(res) {
            RouteService.cleanMap(polyline !== "undefined", RouteService.map);
            var color = '';
            for (var path in res.data) {
              if (path === 'shortestPath') {
                color = 'red';
              } else if (path === 'minElevationPath') {
                color = 'blue';
              }
              console.log(path, color);
              var coords = res.data[path][0];
              var elevation = res.data[path][1];
              plotRoute(coords, elevation, color);
            }
          
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

      var plotRoute = function(coords, elevation, color) {
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
          color: color,
          className: 'path_2d'
        }).addTo(RouteService.map);
        RouteService.map.fitBounds(polyline.getBounds());

        // renders the resampledRoute after the elevation data is returned from googleapi:
        L.geoJson(resampledPath, {
          pointToLayer: function(feature, latlng) {
            var roundedElev = feature.properties.elevation.toFixed(2);
            var cssHeight = roundedElev;
            var myIcon = L.divIcon({
              className: 'elevations',
              html: '<div class="elevmarker"><div class="markercircle bottomcap" style="background:' + color + '"></div><div class="markerline" style="height:' + cssHeight + 'px; background:' + color + '">' + '</div><div class="markercircle" style="background:' + color + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
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
