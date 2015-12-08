;
(function() {
  'use strict';
  angular.module('app.routeInput', [])
    .controller('RouteInputController', ['$rootScope', '$location', '$q', 'RouteService', function($rootScope, $location, $q, RouteService) {
      var vm = this;
      vm.selectedStart;
      vm.selectedEnd;

      var polyline;
      var queryResult;

      $rootScope.$on("markerUpdate", function(event, args) {
        vm.selectedStart = {};
        var tempCoords = args[0].getLatLng();
        vm.selectedStart.center = [tempCoords.lng, tempCoords.lat];
        vm.selectedStart.place_name = 'Marker Start Position';
        console.log(vm.selectedStart);
        
        if (args[1]) {
          vm.selectedEnd = {};
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
          }, function errorCb(res) {
            console.log("error posting route request", res.status);
          });
      };

    }])
})();
