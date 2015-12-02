/***

  Route File:
  Invoke different utility functions depending on parameters provided by the front-end

***/
var Q = require('q');
var shortestPath = require('../utility/shortestPath.js');
var minElevationPath = require('../utility/minElevationPath.js');
var closestNode = require('../utility/closestNode.js');
module.exports = function(req, res) {
  var results = {};

  if (req.body.start && req.body.end) {
    getStartEndNodes(req.body.start, req.body.end)
    .then(function(param){
      var start = param.startNode;
      var end = param.endNode;
      
      var shortestPathChecked = req.body.preferences.shortestPathChecked;
      var minElevPathChecked = req.body.preferences.minElevPathChecked;

      console.log("shortestPathChecked",shortestPathChecked);
      console.log("minElevPathChecked", minElevPathChecked); 

      var totalSelections = 0;
      if (shortestPathChecked) {
        totalSelections++;
      }
      if (minElevPathChecked) {
        totalSelections++;
      }

      var counter = 0;
      if( start && end && shortestPathChecked) {
        /**
        Shortest Path from Dijkstra Algorithm
        **/
        console.log("calculating shortest path..."); 
        shortestPath(start, end, function(err, result){
          if(err) {
            console.error('could not obtain the shortest path: ', err);
            res.send(err);
          } else {
            results.shortestPath = result;
            counter++;
            if (counter === totalSelections) {
              console.log(results.shortestPath);
              res.send(results);
            }
          }
        });       
      } 

      if (start && end && minElevPathChecked) {
        /**
        Minimum Elevation Path from Dijkstra Algorithm
        **/
        console.log("calculating minimum elevation route...");
        minElevationPath(start, end, function(err, result){
          if(err) {
            console.error('could not obtain the minimum elevation path: ', err);
            res.send(err);
          } else {
            // console.log('result when querying the minimum elevation path: ', result[0]);
            // result[0][0].unshift([req.body.start[1], req.body.start[0]]);
            // result[0][result[0].length-1].push([req.body.end[1], req.body.end[0]]);
            results.minElevationPath = result;
            counter++;
            if (counter === totalSelections) {
              res.send(results);
            }            
          }
        });     
      }

    });
  }

}

var getStartEndNodes = function(startCoord, endCoord) {
  var defer = Q.defer();
  var startNode, endNode;
  closestNode(startCoord, function (closestStartNode){
    // the id of the closest node to the start point of the request is closestNode[id]
    // distance from the route request point in meters is closestNode[distance]
    startNode = closestStartNode.id;
    closestNode(endCoord, function (closestEndNode) {
      // this works to get the closest end node as well.
      endNode = closestEndNode.id; 
      defer.resolve({startNode: startNode, endNode: endNode});
    })
  })

  return defer.promise;    
}