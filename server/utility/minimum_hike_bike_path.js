/***

  Utility Function File:
  Fastest Hiking and Biking Paths from Dijkastra Algorithm
  @param: start - index of the start node
          end - index of the end node
          hikeOrBike - ["hike", "bike"], tells the function which velocity model cost to use for the path finding
          callback - callback on query result 
  @return: coordinates - nested array of latitude and longitude of points in all line segments
           [[[x1, y1], [x2, y2]], [[x4, y4], [x3, y3], [x2, y2]]]

***/

var db = require('../db/db.js');
var process = require('./process_result.js');
var elev = require('./get_elevation_data.js');

module.exports = function(start, end, hikeOrBike,callback) {
  console.log("start," , start, "end", end)
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, "+hikeOrBike+"_cost::double precision AS cost, r_"+hikeOrBike+"_cost::double precision AS reverse_cost FROM ways WHERE length !=0'," + start + "," + end + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways...", err);
    }
    var coordinates = process(result);
    var path_data;
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};