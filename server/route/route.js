/***

  Route File:
  Invoke different utility functions depending on parameters provided by the front-end

***/
var Q = require('q');
var shortestPath = require('../utility/shortestPath.js');
var minElevationPath = require('../utility/minElevationPath.js');
var closestNode = require('../utility/closestNode.js');
module.exports = function(req, res) {
  var start;
  var end;
  var elevation = true;

  // default start/end points for testing (611 mission to 598 market)
  req.body.start = req.body.start || [ -122.399836, 37.7875 ];
  req.body.end = req.body.end || [ -122.401752, 37.789027 ];

  if (req.body.start && req.body.end) {
    getStartEndNodes(req.body.start, req.body.end)
    .then(function(param){
      start = param.startNode;
      end = param.endNode;
      console.log("start "+start+"end "+end);
      if( start && end && !elevation) {
        /**
        Shortest Path from Dijkstra Algorithm
        **/
        console.log("calculating shortest path..."); 
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
            // console.log('result when querying the minimum elevation path: ', result[0]);
            result[0][0].unshift([req.body.start[1], req.body.start[0]]);
            result[0][result[0].length-1].push([req.body.end[1], req.body.end[0]]);
            res.send(result);
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
      console.log("start and end nodes here: " + startNode, endNode);
      defer.resolve({startNode: startNode, endNode: endNode});
    })
  })

  return defer.promise;    
}