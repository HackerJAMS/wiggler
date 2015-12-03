

var db = require('../db/db.js');
var process = require('./processRes.js');
var elev = require('./elevationData.js');

module.exports = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, el_dist_cost::double precision AS cost, r_el_dist_cost::double precision AS reverse_cost FROM ways'," + start + "," + end + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways...", err);
    }
    var coordinates = process(result);
    var path_data;
    // callback(err, [coordinates,[]]);
    // console.log(coordinates);
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      // console.log('elevations', elevation.results);
      callback(err, path_data);
    });
  });
};