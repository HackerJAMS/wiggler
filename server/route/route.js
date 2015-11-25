/***

  Route File:
  Invoke different utility functions depending on parameters provided by the front-end

***/
var shortestPath = require('../utility/shortestPath.js');
var minElevationPath = require('../utility/minElevationPath.js');
var closestNode = require('../utility/closestNode.js');
module.exports = function(req, res) {
  if (req.body.start && req.body.end) {
    closestNode(req.body.start, function (closestNode){
      // the id of the closest node to the start point of the request is closestNode[id]
      // distance from the route request point in meters is closestNode[distance]
    })

    closestNode(req.body.end, function (closestNode) {
      // this works to get the closest end node as well. 
    })
  }

  // var start = req.body.start;
  // var end = req.body.end;
  var start = 30;
  var end = 60;
  var elevation = true;

  if( start && end && !elevation) {
    /**
    Shortest Path from Dijkstra Algorithm
    **/
    shortestPath(start, end, function(err, result){
      if(err) {
        console.error('could not obtain the shortest path: ', err);
        res.send(err);
      } else {
        console.log('result when querying the shortest path: ', result);
        res.send(result);
      }
    });       
  } else if (start && end && elevation) {
    /**
    Minimum Elevation Path from Dijkstra Algorithm
    **/
    console.log("calculating minimum elevation route...");
    minElevationPath(start, end, function(err, result){
      if(err) {
        console.error('could not obtain the minimum elevation path: ', err);
        res.send(err);
      } else {
        console.log('result when querying the minimum elevation path: ', result);
        res.send(result);
      }
    });     
  }
}