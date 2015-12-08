var db = require('../db/db.js');
var process = require('./processRes.js');
var elev = require('./elevationData.js');

module.exports = function(start, hikeOrBike, maxDist, callback) {
  console.log("loop start,", start)
    // find node closest to given start point
  // find all nodes within a certain distance 
  var distQuery = "SELECT DISTINCT id, distance FROM (SELECT id, class_id, st_distance(a.the_geom, poi) AS distance FROM ways_vertices_pgr a, (SELECT st_makepoint(" + node[0] + "," + node[1] + ")::geography AS poi) AS poi, ways AS b WHERE (id=b.source or id=b.target) AND class_id NOT IN (101,102,103,104,105,122)) AS d_table WHERE distance BETWEEN " + distRange[0] + " AND " + distRange[1] + " ORDER BY distance LIMIT 20";

  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, " + hikeOrBike + "_cost::double precision AS cost, r_" + hikeOrBike + "_cost::double precision AS reverse_cost FROM ways WHERE length !=0'," + start + "," + end + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if (err) {
      console.log("err when query table ways...", err);
    }

    var coordinates = process(result);
    var path_data;
    elev(coordinates, function(elevation) {
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};

select seq, id1 as node,id2 as edge, cost from pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, bike_cost::double precision AS cost, r_bike_cost::double precision as reverse_cost FROM ways',12133,18, true, true);

