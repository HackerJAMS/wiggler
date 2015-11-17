/***

  Database Configuration File

***/
var pg = require('pg');

// Connect to AWS database
// postgres://username:password@localhost/database
var conString = process.env.DB_URL_STR;
module.exports = new pg.Client(conString);

// db.query("CREATE TABLE route AS SELECT seq, id1 AS node, id2 AS edge, cost, b.the_geom FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, length::double precision AS cost FROM ways', 30, 60, false, false) a LEFT JOIN ways b ON (a.id2 = b.gid);", function(err, result) {
//   if(err) {
//     return console.error('could not create the table: ', err);
//   }
//   console.log('result when creating table', result);
// });

// client.query('SELECT seq, node, edge, cost, ST_AsText(ST_Transform(the_geom,4326)) as pt_lonlat from route', function(err, result) {
//   console.log('result', result);
// })

// client.query('SELECT gid, source, target, length from ways limit 10', function(err, result) {
//   console.log('result', result);
// })
