;
(function() {
  'use strict';
  angular.module('app.map', [])
    .controller('MapController', ['$location', 'RouteService', 'usSpinnerService','$mdSidenav', '$swipe', function($location, RouteService, usSpinnerService, $mdSidenav, $swipe) {

      var vm = this;

      // functions for 3d map rotation
      vm.angle = 0;
      vm.xdrag = 0;
      vm.isDown = false;
      vm.xpos = 0;

      vm.tiltCheck = RouteService.tiltCheck;

      var mapRot = angular.element(document.querySelector('#maprotor'));
      var mapEl = angular.element(document.querySelector('#map'));
      var elevMarker = angular.element(document.querySelectorAll('.elevmarker'));
      
      vm.tiltCheck = false;

      //map rotation touch gesture
      $swipe.bind(mapRot, {
        start: function(e){
          vm.xpos = e.x;

        },
        move: function(e){
          vm.xdrag = ((vm.xpos - e.x)/4 ) % 360;
          mapEl.attr('style', '-webkit-transform:rotateZ(' + (vm.angle + vm.xdrag) % 360 + 'deg)');
          elevMarker.attr('style', '-webkit-transform:rotateX(90deg) rotateY(' + (vm.angle + vm.xdrag) * (-1) % 360 + 'deg)');
        },
        end: function(e){
        },
        cancel: function(){
        }
      });
   

      vm.mouseDown = function(e) {
        if (RouteService.tiltCheck) {
          vm.xpos = e.pageX;
          vm.isDown = true;
        }
      }

      vm.mouseMove = function(e) {
        if (RouteService.tiltCheck) {
          if (vm.isDown) {
            elevMarker = angular.element(document.querySelectorAll('.elevmarker'));

            vm.xdrag = (vm.xpos - e.pageX) / 4;
            mapEl.attr('style', '-webkit-transform:rotateZ(' + (vm.angle + vm.xdrag) % 360 + 'deg)');
            elevMarker.attr('style', '-webkit-transform:rotateX(90deg) rotateY(' + (vm.angle + vm.xdrag) * (-1) % 360 + 'deg)');
          }
        }
      }

      vm.mouseUp = function(e) {
        if (RouteService.tiltCheck) {
          vm.isDown = false;
          vm.angle = vm.angle + vm.xdrag;
        }
      }

      // rotate (tilt) map
      vm.tiltMap = function() {
        if (RouteService.turfLine) {
          RouteService.map.fitBounds(RouteService.map.featureLayer.setGeoJSON(RouteService.turfLine).getBounds(), {
            paddingTopLeft: [150, 50],
            paddingBottomRight: [150, 50]
          });
        }
        
        RouteService.tiltCheck = true;
        vm.tiltCheck = true;
        RouteService.map.dragging.disable();
        mapRot.addClass("tilted");
      };
      
      vm.cleanMap = function(){
        RouteService.cleanMap();
      };

      vm.restoreMap = function() {
        var elevMarker = angular.element(document.querySelectorAll('.elevmarker'));
        var path = angular.element(document.querySelector('path'));

        mapEl.attr('style', 'transition:all 0.25s');
        elevMarker.attr('style', '');
        // path.css('stroke-dashoffset', 0)
        RouteService.tiltCheck = false;
        vm.tiltCheck = false;
        mapRot.removeClass("tilted");
        RouteService.map.dragging.enable();
        vm.angle = 0;
        if (RouteService.featureLayer !== undefined) {
          RouteService.map.fitBounds(RouteService.featureLayer.getBounds());
        }
      };
    }])
})();
