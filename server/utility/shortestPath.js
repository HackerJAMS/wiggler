/***

  Utility Function File:
  Shortest Path from Dijkastra Algorithm
  @param: start - index of the start node
          end - index of the end node
          callback - callback on query result 

***/
var db = require('../db/db.js');
module.exports = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, cost, b.the_geom FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, length::double precision AS cost FROM ways'," + start + "," + end + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid);";
  
  db.query(queryString, function(err, result) {
    callback(err, result);
  });
};