var db = require('../db/db.js');

module.exports = {}

module.exports = function (node, callback) {
  var queryString = "select id,st_distance(geog, poi) as distance from nodes_with_elevation a, (select st_makepoint("+node[0]+","+node[1]+")::geography as poi) as poi order by st_distance(geog, poi) limit 1;";
  db.query(queryString, function (err,result){
    if (err) console.log("error finding closest starting node: ", err);
    // sending back the closest node to the starting point of the route request
    // result.rows[0] takes the following form, with distance in meters : { id: '2920822251', distance: 4.221140635 }
    callback(result.rows[0]);
  })
}
