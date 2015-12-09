;
(function() {
  'use strict';
  angular.module('app.elevationGraph', ['d3'])
    .directive('elevationGraph', ['d3Service', '$window', function(d3Service, $window) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        link: function(scope, element, attr) {
          d3Service.d3().then(function(d3) {

            var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 40
              },
              width = 400 - margin.left - margin.right,
              height = 300 - margin.top - margin.bottom;

            var x = d3.scale.linear()
              .range([0, width]);

            var y = d3.scale.linear()
              .range([height, 0]);

            var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom");

            var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(10, "ft");
            
            //////////////////////////
            var line = d3.svg.line()
              .interpolate("monotone")
              .x(function(d) {return x(d.properties.distance)})
              .y(function(d) {return y(d.properties.elevation)});

            var svg = d3.select(element[0]).append('svg')
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // listen for init function in routeInputController
            // scope.$on('init2DGraph', function(event, data) {

            // remove all previous items before render
            svg.selectAll('*').remove();

            //   var array1 = scope.data.minElevPath.resampledPath.features.concat(scope.data.shortestPath.resampledPath.features);

            //   var array2 = scope.data.minHiking.resampledPath.features.concat(scope.data.minBiking.resampledPath.features);  

            //   var domainArray = array1.concat(array2); 
            var paths = [];
            for (var pathType in scope.data) {
              paths = paths.concat(scope.data[pathType].resampledPath.features);
            } 

            // //////////////////////////
            x.domain(d3.extent(paths, function(d){return d.properties.distance;}));
            y.domain(d3.extent(paths, function(d){return d.properties.elevation;}));

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

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
              .append("text")
              .attr("x", width)
              .attr("dx", ".71em")
              .style("text-anchor", "end")
              .text("Distance / miles");

            svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Elevation / meters");

            //////////////////////////
            if (scope.data.minElevPath) {
              svg.append("path")
                .datum(scope.data.minElevPath.resampledPath.features)
                .attr("class", "line min_elevation_path")
                .attr("d", line);
            }
            if (scope.data.shortestPath) {
              svg.append("path")
                .datum(scope.data.shortestPath.resampledPath.features)
                .attr("class", "line shortest_path")
                .attr("d", line);
            }
            if (scope.data.minHiking) {
              svg.append("path")
                .datum(scope.data.minHiking.resampledPath.features)
                .attr("class", "line fastest_walking")
                .attr("d", line);
            }
            if (scope.data.minBiking) {
              svg.append("path")
                .datum(scope.data.minBiking.resampledPath.features)
                .attr("class", "line fastest_biking")
                .attr("d", line);
            }            
            // });
          });
        }
      };
    }]);
})();
