;
(function() {
  'use strict';
  angular.module('app.routeService', [])
    .factory('RouteService', ['$rootScope', '$http', function($rootScope, $http) {
      var route = {};

      // data shared by controllers
      // route.map;
      // route.turfLine;
      // route.legendData;
      route.routeData = []; // raw route data from server
      route.resampledRoutes = {}; // processed resampled routes
      route.tiltCheck = false; // initialize the map in 2d
      // route.selectedStart;
      // route.selectedEnd;
      // route.currentPosition;
      // route.routePrefs;
      // route.featureLayer;

      var accessToken = 'pk.eyJ1IjoiMTI3NnN0ZWxsYSIsImEiOiJjaWg4ZGEwZmEwdGNkdjBraXl1czIzNnFjIn0.RXXfMNV-gtrQyrRzrP2yvQ';
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
      route.cleanMap = function() {
        // clear 2d lines
        route.map.eachLayer(function(layer) {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
              route.map.removeLayer(layer);
            }
          })
          // clear 3d markers
        var elevationIcons = angular.element(document.querySelectorAll('.elevations'));
        elevationIcons.remove();
        // clear legend
        route.map.legendControl.removeLegend(route.legendData);
        route.legendData = "";
        // clear user-placed start, end markers data
        route.markers = [];
      };

      //************* Route Services *************   
      route.addLegend = function(prefs) {
        var checkBoxes = {
          shortestPathChecked: "Shortest",
          minElevPathChecked: "Minimum elevation change",
          minBikingChecked: "Fastest biking",
          minHikingChecked: "Fastest walking",
          loop_path: "Running loop"
        };

        //solarized colors
        var routeColors = {
          "Shortest": '#2176C7',
          "Minimum elevation change": '#C61C6F',
          "Fastest biking": '#2aa198',
          "Fastest walking": '#D9A800',
          "Running loop": "#30a07A"
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
          return '<span><strong>Route Types</strong></span><ul>' + labels.join('') + '</ul>';
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
      route.reverseGeocoding = function(address) {
        var query = address.replace(/\s+/g, '+');
        return $http({
          method: 'GET',
          url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + query + '.json?access_token=' + accessToken
        })
      }

      route.geocoding = function(lon, lat) {
        return $http({
          method: 'GET',
          url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + lon + "," + lat + '.json?proximity=-122.446,37.773&access_token=' + accessToken
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

      route.postLoopRequest = function(start, distance) {
        return $http({
          method: 'POST',
          url: '/loop',
          data: {
            start: start,
            distance: distance
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

      route.getResampledPath = function(line, elevationCollection, numPoints) {
        var collection = [];
        var distance = 0;

        var turfDistance = turf.lineDistance(line, 'miles');
        var resamplePoints = numPoints || Math.max((turfDistance/.015), 150);
        var interval = turfDistance / resamplePoints;
        for (var i = 0; i < resamplePoints; i++) {
          var point = turf.along(line, distance, 'miles');
          collection.push(point);
          // use elevation data from nearest point in elevationCollection
          if (elevationCollection.features !== undefined) {
            var nearest = turf.nearest(point, elevationCollection);
            // convert the elevation from meters to feet!!!
            collection[i].properties.elevation = nearest.properties.elevation * 3.28084;
            collection[i].properties.distance = distance;
          }
          // update distance
          distance = distance + interval;
        }
        return turf.featurecollection(collection);
      }

      // format elevation and path data to use as turf collection
      route.getElevationPath = function(elevation) {
        var collection = [];
        var distance = 0;
        elevation.forEach(function(n, i) {
          var coordArr = [n.location.lng, n.location.lat];
          var elevation = n.elevation;
          collection.push(turf.point(coordArr));
          collection[i].properties.elevation = elevation;
          distance += collection[i-1] ? turf.distance(collection[i], collection[i-1], "miles") : 0;
          collection[i].properties.distance = distance;
        });
        return turf.featurecollection(collection);
      }



      route.getDirections = function(coords) {
        // mapbox directions api will only accept 25 waypoints, which was not enough to ensure
        // their route matched the ones generated by our algorithm. 
        var coordStr = coords.slice(0, 25).join(';');
        var coordStr2 = coords.slice(25).join(';');

        return $http({
          method: 'GET',
          url: 'https://api.mapbox.com/v4/directions/mapbox.walking/' + coordStr + '.json/',
          params: {
            access_token: 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw'
          }
        }).then(function successCb(res) {
          var geogJson = {
            type: "Feature",
            geometry: res.data.routes[0].geometry
          };
          return $http({
            method: 'GET',
            url: 'https://api.mapbox.com/v4/directions/mapbox.walking/' + coordStr2 + '.json/',
            params: {
              access_token: 'pk.eyJ1IjoibWxsb3lkIiwiYSI6Im9nMDN3aW8ifQ.mwiVAv4E-1OeaoR25QZAvw'
            }
          }).then(function successCb(res2) {
            var directions = res.data.routes[0].steps.map(function(step) {
              return {maneuver: step.maneuver.instruction, distance: step.distance};
            });

            res2.data.routes[0].steps.forEach(function(step) {
              directions.push({maneuver: step.maneuver.instruction, distance: step.distance})
            })

            return directions;
          }, function errorCb(res2) {
            console.log("error getting directions", res2)

          })

        }, function errorCb(res) {
          console.log("error getting directions", res)
        })
      }

      route.addStartEndMarkers = function(start, end) {
        var locationsGeojson = [];
        [start, end].forEach(function(point, i) {
          locationsGeojson.push({
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": point
            },
            "properties": {
              "marker-size": "small",
              "marker-symbol": i === 0 ? "pitch" : "embassy"
            }
          });
        })
        L.mapbox.featureLayer(locationsGeojson).addTo(route.map);
      }

      route.markers = [];
      route.clickMarker = function(e) {
        if (!route.tiltCheck) {
          if (route.markers.length < 2) {
            var latlngArr = [e.latlng["lat"].toFixed(4), e.latlng["lng"].toFixed(4)];
            var marker = L.marker(new L.LatLng(latlngArr[0], latlngArr[1]), {
              icon: L.mapbox.marker.icon({
                "marker-color": "ff8888",
                "marker-size": "small",
                "marker-symbol": route.markers.length === 0 ? "pitch" : "embassy"
              }),
              draggable: true
            });
            marker.on("dragend", function() {
              $rootScope.$emit("markerUpdate", route.markers);
            })
            marker.addTo(route.map);
            route.markers.push(marker);
            $rootScope.$emit("markerUpdate", route.markers);

          }
        }
      }
      return route;
    }])



})();
