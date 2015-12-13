;
(function() {
  'use strict';

  angular.module('app')
    .directive('mapbox', ['RouteService','$window','$timeout', function(RouteService, $window, $timeout) {
      return {
        // restrict this directive to an html element ('E':element, 'A': attribute, 'C': component)
        restrict: 'E',
        replace: true,
        // create isolate scope for the mapbox directive element, bind the variable callback to itself
        scope: {
          callback: "="
        },

        template: '<div id="map"/>',
        // link function allows the directive to manipulate the DOM
        link: function(scope, element, attributes) {
          // molly's public token
          L.mapbox.accessToken = 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw';
          var legend_position = $window.innerWidth <= 768 ? 'bottomright' : 'topright';
          var zoom_control = $window.innerWidth <= 768 ? false : true;
          var map = L.mapbox.map(element[0], 'mapbox.run-bike-hike', {
            // tileSize: 5120,
            zoomControl: zoom_control,
            maxZoom: 19,
            minZoom: 11,
            legendControl: { position: legend_position}
          });

        
          var getPxBounds = map.getPixelBounds;

          map.getPixelBounds = function() {
            var bounds = getPxBounds.call(this);
            // ... extend the bounds for 3d viewing purposes
            bounds.min.x = bounds.min.x - 1000;
            bounds.min.y = bounds.min.y - 1000;
            bounds.max.x = bounds.max.x + 1000;
            bounds.max.y = bounds.max.y + 1000;
            return bounds;
          };
          
          map.on("click", function (e){
            RouteService.clickMarker(e);
          })
          // this fixes the map glitch that causes the map to be loaded initially with
          // the wrong container size, causing the map to be incorrectly centered
          $timeout(function() {
            map.invalidateSize(true);
            RouteService.initMap(map);
          })
        }
      }
    }]);
})();
