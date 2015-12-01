;
(function() {
  'use strict';
  angular.module('app.routeService',[])
    .factory('RouteService', ['$http', function($http) {
      var route = {};
      
      route.map;
      route.turfLine;
      route.initMap = function(map) {
        map.setView([37.774, -122.496], 13);
        map.scrollWheelZoom.disable();
        route.map = map;
      };

      route.postRouteRequest = function(start, end, preferences) {
        return $http({
          method: 'POST',
          url: '/route',
          data: {
            start: start,
            end: end,
            preferences: preferences
          }
        })
      };
      route.postElevationRequest = function(coordinates) {
        return $http({
          method: 'POST',
          url: '/elevationquery',
          data: {
            coordinates: coordinates
          }
        })
      };
      // convert user-entered addresses to coordinates through mapbox query
      route.geocoding = function(address) {
        var accessToken = 'pk.eyJ1IjoiMTI3NnN0ZWxsYSIsImEiOiJjaWg4ZGEwZmEwdGNkdjBraXl1czIzNnFjIn0.RXXfMNV-gtrQyrRzrP2yvQ';
        var query = address.replace(/\s+/g, '+');
        return $http({
          method: 'GET',
          url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?proximity=-122.446,37.773&access_token=' + accessToken         
        })
      } 

      // this function removes any existing polylines from the map before adding a new one 
      route.cleanMap = function(polyline, map) {
        if (polyline) {
          map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline) {
              map.removeLayer(layer);
            }
          })
        }
      };
      // process the coordinates in the path sent from the server routing algorithm
      route.getPath = function(coords) {
        var route = [];
        for (var i = 0; i < coords.length; i++) {
          for (var j = 0; j < coords[i].length; j++) {
            if (coords[i][j][0] !== null) {
              route.push([Number(coords[i][j][1]),Number(coords[i][j][0])]);
            }
          }
        }
        return route;
      };
      // resample route with more points for 3d elevation display
      route.getResampledPath = function(line, elevationCollection) {
        var collection = [];
        var distance = 0;
        var resamplePoints = 100;
        var turfDistance = turf.lineDistance(line, 'miles');
        var interval = turfDistance / resamplePoints;

        for (var i = 0; i < resamplePoints; i++) {
          var point = turf.along(line, distance, 'miles');
          // use elevation data from nearest point in elevationCollection
          var nearest = turf.nearest(point, elevationCollection);
          // push resampled point and elevation into collection
          collection.push(point);
          collection[i].properties.elevation = nearest.properties.elevation;
          // update distance
          distance = distance + interval;
        }
        return turf.featurecollection(collection);
      }
      // format elevation and path data to use as turf collection
      route.getElevationPath = function(elevation) {
        var collection = [];
        elevation.forEach(function(n, i){
          var coordArr = [n.location.lng, n.location.lat];
          var elevation = n.elevation;
          collection.push(turf.point(coordArr));
          collection[i].properties.elevation = elevation;
        });
        return turf.featurecollection(collection);
      }

      route.drawRoute = function(path) {
        var polyline = L.polyline(path, {color:"red", className: "path_2d"}).addTo(route.map);
        // console.log("polyline bounds", polyline.getBounds());
        route.map.fitBounds(polyline.getBounds());
        // console.log("map bounds after fit", route.map.getBounds())

      }

      return route;
    }])



})();
