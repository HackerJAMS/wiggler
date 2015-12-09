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

            var line = d3.svg.line()
              // .interpolate("basis")
              .x(function(d) {return x(d[0])})
              .y(function(d) {return y(d[1])});

            var svg = d3.select(element[0]).append('svg')
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            // listen for init function in routeInputController
            // scope.$on('init2DGraph', function(event, data) {

              console.log("recieved data on", scope.data);
              // remove all previous items before render
              svg.selectAll('*').remove();

              console.log('x bounds', d3.extent(scope.data, function(d){return d[0];}))
              console.log('y bounds', d3.extent(scope.data, function(d){return d[1];}))
              x.domain(d3.extent(scope.data, function(d){return d[0];}));
              y.domain(d3.extent(scope.data, function(d){return d[1];}));

              svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

              svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Elevation");

              svg.append("path")
                .datum(scope.data)
                .attr("class", "line")
                .attr("d", line);
            // });
          });
        }
      };
    }]);
})();
