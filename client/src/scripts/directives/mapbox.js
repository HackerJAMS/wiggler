;
(function() {
  'use strict';

  angular.module('app')
    .directive('mapbox', [function() {
      var _mapboxMap;
      return {
        // restrict this directive to an html element ('E':element, 'A': attribute, 'C': component)
        restrict: 'E',
        replace: true,
        // create isolate scope for the mapbox directive element, bind the variable callback to itself
        scope: {
          callback: "="
        },
        template: '<div></div>',
        // link function allows the directive to manipulate the DOM
        link: function(scope, element, attributes) {
          // molly's public token
          L.mapbox.accessToken = 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw';
          var map = L.mapbox.map(element[0], 'mapbox.emerald', {
            maxZoom: 19,
            minZoom: 13
          });
          scope.callback(map);
        }
      };
    }]);
})();
