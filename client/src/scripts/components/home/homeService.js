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

      return route;
    }])

})();
