//************* calls googleapi for refined elevation data *************

       // var newPoints = resampledPath.features.slice();
       // var newPointCoordinates = newPoints.map(function(n, i) {
       //        return n.geometry.coordinates;
       //     });

       // RouteService.postElevationRequest(newPointCoordinates)
       // .then(function successCb(res){
       //    var resampledPoints = RouteService.getElevationPath(res.data);
       //   //test for unique values; refactor for jasmine test

       //    var uniqueArr = resampledPoints.features;
       //    var nonUniqueArr = resampledPath.features;
       //    uniqueArr.forEach(function(feature){
       //      console.log(feature.properties.elevation);
       //  });

            
       //      L.geoJson(resampledPoints, {
       //      pointToLayer: function(feature, latlng) {
       //        var roundedElev = feature.properties.elevation.toFixed(2);
       //        var cssHeight = roundedElev;
       //        var myIcon = L.divIcon({
       //          className: 'elevations',
       //          html: '<div class="elevmarker"><div class="markercircle bottomcap marker-' + pathType + '"></div><div class="markerline marker-' + pathType + '" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle marker-' + pathType + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
       //        });
       //        return L.marker(latlng, {
       //          icon: myIcon
       //        });
       //      }
       //    }).addTo(RouteService.map);
       // }, function errorCb(res){
       //    console.log('error in elevation request', res.status);
       // });
       
//**************************************


// ;
// (function() {
//   'use strict';
//   angular.module('app.elevationGraph', ['d3'])
//     .directive('elevationGraph', ['d3Service', '$window', function(d3Service, $window) {
//       return {
//         restrict: 'E',
//         scope: {},
//         link: function(scope, element, attr) {
//           d3Service.d3().then(function(d3) {

//             var margin = {
//                 top: 20,
//                 right: 20,
//                 bottom: 30,
//                 left: 40
//               },
//               width = 400 - margin.left - margin.right,
//               height = 300 - margin.top - margin.bottom;

//             var x = d3.scale.ordinal()
//               .rangeRoundBands([0, width], .1);

//             var y = d3.scale.linear()
//               .range([height, 0]);

//             var xAxis = d3.svg.axis()
//               .scale(x)
//               .orient("bottom");

//             var yAxis = d3.svg.axis()
//               .scale(y)
//               .orient("left")
//               .ticks(10, "ft");

//             var svg = d3.select(element[0]).append('svg')
//               .attr("width", width + margin.left + margin.right)
//               .attr("height", height + margin.top + margin.bottom)
//               .append("g")
//               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//             scope: {
//               obj: '='
//             }

//             // listen for init function in routeInputController
//             scope.$on('init2DGraph', function(event, data) {

//               scope.data = data.features;

//               // remove all previous items before render
//               svg.selectAll('*').remove();

//               x.domain(scope.data.map(function(d) {
//                 // console.log(d, 'xdomain');
//                 return d.geometry.coordinates[0];
//               }));
//               y.domain([0, d3.max(scope.data, function(d) {
//                 return d.properties.elevation;
//               })]);

//               svg.append("g")
//                 .attr("class", "y axis")
//                 .call(yAxis)
//                 .append("text")
//                 .attr("transform", "rotate(-90)")
//                 .attr("y", 6)
//                 .attr("dy", ".71em")
//                 .style("text-anchor", "end")
//                 .text("Elevation");

//               svg.selectAll(".bar")
//                 .data(scope.data)
//                 .enter().append("rect")
//                 .attr("class", "bar")
//                 .attr("x", function(d) {
//                   return x(d.geometry.coordinates[0]);
//                 })
//                 .attr("width", x.rangeBand())
//                 .attr("y", function(d) {
//                   return y(d.properties.elevation);
//                 })
//                 .attr("height", function(d) {
//                   return height - y(d.properties.elevation);
//                 });
//             });
//           });
//         }
//       };
//     }]);
// })();


            // var paths = [];
            // for (var pathType in scope.data) {
            //   paths.push(scope.data[pathType].resampledPath.features);
            // }

            // x.domain([d3.min(paths, function(path){ return d3.min(path, function(d){
            //   return d.properties.distance;
            // })}), d3.max(paths, function(path){ return d3.max(path, function(d){
            //   return d.properties.distance;
            // })})])

            // y.domain([d3.min(paths, function(path){ return d3.min(path, function(d){
            //   return d.properties.elevation;
            // })}), d3.max(paths, function(path){ return d3.max(path, function(d){
            //   return d.properties.elevation;
            // })})])