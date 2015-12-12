var db = require('../db/db.js');

module.exports = {}

module.exports = function (node, callback) {
  var queryString = "select id, class_id, st_distance(a.the_geom, poi) as distance from ways_vertices_pgr a, (select st_makepoint("+node[0]+","+node[1]+")::geography as poi) as poi, ways as b where (id=b.source or id=b.target) and class_id not in (101,102,103,104,105,122) order by distance limit 1";
  db.query(queryString, function (err,result){
    if (err) console.log("error finding closest starting node: ", err);
    // sending back the closest node to the starting point of the route request
    // result.rows[0] takes the following form, with distance in meters : { id: '2920822251', distance: 4.221140635 }
    callback(result.rows[0]);
  })
}