;
(function() {
  'use strict';
  angular.module('app.routeService', [])
    .factory('RouteService', ['$http', function($http) {
      var route = {};

      // data shared by controllers
      route.map; 
      route.turfLine;
      route.legendData;
      route.routeData; // raw route data from server
      route.currentPosition;
      route.routePrefs;

//************* Map Services *************      
      route.initMap = function(map) {
        new L.Control.Zoom({
          position: 'topleft'
        }).addTo(map);
        map.setView([37.774, -122.446], 13);
        map.scrollWheelZoom.disable();
        route.map = map;
      };

      // this function removes any existing polylines from the map before adding a new one 
      route.cleanMap = function(polyline, map) {
        // clear 2d lines
        map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline) {
              map.removeLayer(layer);
            }
          })
        // clear 3d markers
        var elevationIcons = angular.element(document.querySelectorAll('.elevations'));
        elevationIcons.remove();
        // clear legend
        route.map.legendControl.removeLegend(route.legendData);
        route.legendData = "";
      };

//************* Route Services *************   
      route.addLegend = function(prefs) {
        var checkBoxes = {
          shortestPathChecked: "Shortest",
          minElevPathChecked: "Minimum elevation change",
          minBikingChecked: "Fastest biking",
          minHikingChecked: "Fastest walking"
        };

        var routeColors = {
          "Shortest": '#D28014',
          "Minimum elevation change": '#545166',
          "Fastest biking": '#3D1BFF',
          "Fastest walking": '#57FFDC'
        };

        var routeTypes = {};
        for (var key in prefs) {
          if (prefs[key] === true) {
            routeTypes[checkBoxes[key]] = routeColors[checkBoxes[key]]
          }
        }

        function getLegendHTML() {
          var labels = [];
          for (var i = 0; i < Object.keys(routeTypes).length; i++) {
            var r = Object.keys(routeTypes)[i];
            labels.push(
              '<li><span class="swatch" style="background:' + routeTypes[r] + '"></span> ' + r + '</li>');
          }
          return '<span>Route Types</span><ul>' + labels.join('') + '</ul>';
        }
        route.legendData = getLegendHTML()
        route.map.legendControl.addLegend(route.legendData);
      }

      // bounding box for the auto-complete query
      route.within = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [-122.55661010742188, 37.680559803205114],
                [-122.55661010742188, 37.820632846207864],
                [-122.33139038085936, 37.820632846207864],
                [-122.33139038085936, 37.680559803205114],
                [-122.55661010742188, 37.680559803205114]
              ]
            ]
          }
        }]
      }

      // convert user-entered addresses to coordinates through mapbox query
      route.geocoding = function(address) {
        var accessToken = 'pk.eyJ1IjoiMTI3NnN0ZWxsYSIsImEiOiJjaWg4ZGEwZmEwdGNkdjBraXl1czIzNnFjIn0.RXXfMNV-gtrQyrRzrP2yvQ';
        var query = address.replace(/\s+/g, '+');
        return $http({
          method: 'GET',
          url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?proximity=-122.446,37.773&access_token=' + accessToken
        })
      }

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

      // process the coordinates in the path sent from the server routing algorithm
      route.getPath = function(coords) {
        var route = [];
        for (var i = 0; i < coords.length; i++) {
          for (var j = 0; j < coords[i].length; j++) {
            if (coords[i][j][0] !== null) {
              route.push([Number(coords[i][j][1]), Number(coords[i][j][0])]);
            }
          }
        }
        return route;
      };

      // resample route with more points for 3d elevation display
      route.getResampledPath = function(line, elevationCollection) {
        // var dist_jia = [];
        // var elev_jia = [];
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
          // dist_jia.push(distance);
          // elev_jia.push(nearest.properties.elevation);
          // update distance
          distance = distance + interval;
        }
        // console.log('dist_jia',dist_jia);
        // console.log('elev_jia',elev_jia);
        return turf.featurecollection(collection);
      }

      // format elevation and path data to use as turf collection
      route.getElevationPath = function(elevation) {
        var collection = [];
        elevation.forEach(function(n, i) {
          var coordArr = [n.location.lng, n.location.lat];
          var elevation = n.elevation;
          collection.push(turf.point(coordArr));
          collection[i].properties.elevation = elevation;
        });
        return turf.featurecollection(collection);
      }

      // route.drawRoute = function(path) {
      //   var polyline = L.polyline(path, {
      //     color: "red",
      //     className: "path_2d"
      //   }).addTo(route.map);
      //   // console.log("polyline bounds", polyline.getBounds());
      //   route.map.fitBounds(polyline.getBounds());
      //   // console.log("map bounds after fit", route.map.getBounds())
      // }

      return route;
    }])



})();
