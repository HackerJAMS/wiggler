/***

  Utility Function File:
  Shortest Path from Dijkastra Algorithm
  @param: start - index of the start node
          end - index of the end node
          callback - callback on query result 
  @return: coordinates - nested array of latitude and longitude of points in all line segments
           [[[x1, y1], [x2, y2]], [[x4, y4], [x3, y3], [x2, y2]]]

***/

var db = require('../db/db.js');
var process = require('./processRes.js');
var elev = require('./elevationData.js');

module.exports = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, length::double precision AS cost FROM ways'," + start + "," + end + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways for the shortest path...", err);
    }
    var coordinates = process(result);
    var path_data;
    // callback(err, [coordinates,[]]);
    /*
      elevationDate.js seems not to work...
    */     
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};