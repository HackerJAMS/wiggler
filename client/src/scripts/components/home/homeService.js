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
          i === 0 ? route.push([coords[i].path[0][1], coords[i].path[0][0]]) : true;
          for (var j = 1; j < coords[i].path.length; j++) {
            if (coords[i].path[j][0] !== null) {
              route.push([coords[i].path[j][1], coords[i].path[j][0]]);
            }
          }
        }
        return route;
      };

      return route;
    }])

})();
