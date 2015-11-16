;
(function() {
  'use strict';
  angular.module('app.home', [])
    .controller('HomeController', ['$location', function($location) {
      var vm = this;

      vm.callback = function(map) {
        vm.map = map;
        map.setView([37.773, -122.446], 13);
      };
    }])
})();
