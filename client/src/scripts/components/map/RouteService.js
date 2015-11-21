;
(function() {
  'use strict';
  angular.module('app.map')
    .factory('RouteService', ['$http', function($http) {
      var route = {};
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
      // format elevation and path data to use as turf collection
      route.getElevationPath = function(elevation) {
        var collection = [];
        elevation.forEach(function(n, i){
          var coordArr = [n.location.lng, n.location.lat];
          var elevation = n.elevation;
          collection.push(turf.point(coordArr));
          collection[i].properties.elevation = elevation;
        });
        return collection;
      }

      return route;
    }])

})();
