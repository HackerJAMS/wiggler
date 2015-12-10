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
              height = 200 - margin.top - margin.bottom;

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

            var paths = [];
            for (var pathType in scope.data) {
              paths = paths.concat(scope.data[pathType].resampledPath.features);
            } 

            // //////////////////////////
            x.domain(d3.extent(paths, function(d){return d.properties.distance;}));
            y.domain([0,d3.max(paths, function(d){return d.properties.elevation;})]);

            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
              .append("text")
              .attr("x", width)
              .attr("dx", ".71em")
              .attr("dy", "-0.71em")
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

            var path;
            if (scope.data.minElevPath) {
              path = svg.append("path")
                      .datum(scope.data.minElevPath.resampledPath.features)
                      .attr("class", "line min_elevation_path")
                      .attr("d", line);
              drawPath(path);                                
            }
            if (scope.data.shortestPath) {
              path = svg.append("path")
                      .datum(scope.data.shortestPath.resampledPath.features)
                      .attr("class", "line shortest_path")
                      .attr("d", line);
              drawPath(path);   
            }
            if (scope.data.minHiking) {
              path = svg.append("path")
                      .datum(scope.data.minHiking.resampledPath.features)
                      .attr("class", "line fastest_walking")
                      .attr("d", line);
              drawPath(path);                   
            }
            if (scope.data.minBiking) {
              path = svg.append("path")
                      .datum(scope.data.minBiking.resampledPath.features)
                      .attr("class", "line fastest_biking")
                      .attr("d", line); 
              drawPath(path);               
            }  
            if (scope.data.loop_path) {
              path = svg.append("path")
                      .datum(scope.data.loop_path.resampledPath.features)
                      .attr("class", "line loop_path")
                      .attr("d", line); 
              drawPath(path);               
            } 

            // draw path animation
            function drawPath(path) {
              var totalLength = path.node().getTotalLength();

              // stroke-dasharray: the length of the rendered part of the line and the length of the gap
              // stroke-dashoffset: the position where the dasharray starts
              path
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                  .duration(2000)
                  .ease("linear")
                  .attr("stroke-dashoffset", 0);
            }
                   
            // });
          });
        }
      };
    }]);
})();
