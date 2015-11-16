/***

  Route File:
  Invoke different utility functions depending on parameters provided by the front-end

***/
var shortestPath = require('../utility/shortestPath.js');
module.exports = function(req, res) {
  // var start = req.body.start;
  // var end = req.body.end;
  var start = 30;
  var end = 60;

/**
Shortest Path from Dijkastra Algorithm
**/
  if( start && end ) {
    shortestPath(start, end, function(err, result){
      if(err) {
        console.error('could not obtain the shortest path: ', err);
      }
      console.log('result when querying the shortest path: ', result);
      res.send(result);
    });       
  }
}