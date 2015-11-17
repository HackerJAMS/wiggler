;
(function() {
  'use strict';
  angular.module('app.home')
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
              route.push([Number(coords[i][j][0]),Number(coords[i][j][1])]);
            }
          }
        }
        return route;
      };

      return route;
    }])

})();
