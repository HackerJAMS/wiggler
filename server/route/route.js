/***

  Route File:
  Invoke different utility functions depending on parameters provided by the front-end

***/
var Q = require('q');
var shortestPath = require('../utility/shortestPath.js');
var minElevationPath = require('../utility/minElevationPath.js');
var closestNode = require('../utility/closestNode.js');
var minHikeBike = require('../utility/minHikeBike.js');
module.exports = function(req, res) {
  var results = {};

  if (req.body.start && req.body.end) {
    getStartEndNodes(req.body.start, req.body.end)
    .then(function(param){
      var start = param.startNode;
      var end = param.endNode;
      var prefs = req.body.preferences;
      
      var totalSelections = 0;
      for (var key in prefs) {
        if (prefs[key] === true){
          totalSelections++;
        }
      }

      var pathFunctions = {
        "shortestPathChecked" : shortestPath,
        "minElevPathChecked" : minElevationPath,
        "minBikingChecked" : [minHikeBike, "bike"],
        "minHikingChecked" : [minHikeBike, "hike"]
      };

      var counter = 0;

      function addPath(pathCheckedKey) {
        if (start && end && prefs[pathCheckedKey]) {
          /**
          Shortest Path from Dijkstra Algorithm
          **/
          console.log("calculating"+ pathCheckedKey +" path...");
          if (pathFunctions[pathCheckedKey].constructor === Array) {
            pathFunctions[pathCheckedKey][0](start, end, pathFunctions[pathCheckedKey][1], function(err, result) {
              if (err) {
                console.error('could not obtain the'+ pathCheckedKey + ' path: ', err);
                res.send(err);
              } else {
                var results_key = pathCheckedKey.replace("Checked","")
                results[results_key] = result;
                counter++;
                if (counter === totalSelections) {
                  res.send(results);
                }
              }
            })
          } else {
            pathFunctions[pathCheckedKey](start, end, function(err, result) {
              if (err) {
                console.error('could not obtain the'+ pathCheckedKey + ' path: ', err);
                res.send(err);
              } else {
                var results_key = pathCheckedKey.replace("Checked","")
                results[results_key] = result;
                counter++;
                if (counter === totalSelections) {
                  res.send(results);
                }
              }
            });
          }
        }
      }

    for (var key in prefs) {
      addPath(key);
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