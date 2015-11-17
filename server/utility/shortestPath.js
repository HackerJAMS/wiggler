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
module.exports = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, length::double precision AS cost FROM ways'," + start + "," + end + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid);";

  db.query(queryString, function(err, result) {
    // coordinates
    var coordinates = [];

    for (var i = 0; i < result.rows.length - 1; i++) {
      var string = result.rows[i].st_astext;
      var stringArr = string.slice(11, string.length - 1).split(',');

      var segmentTuple = [];
      for (var j = 0; j < stringArr.length; j++) {
        var pointTuple = [];
        var temp = stringArr[j].split(' ');
        pointTuple.push(temp[1]);
        pointTuple.push(temp[0]);
        segmentTuple.push(pointTuple);
      }
      coordinates.push(segmentTuple);

      // for reverse points in segment
      //   if(result.rows[i].node === result.rows[i].target) {
      //   // reverse the segmentCoordArr
      //     var segmentCoordArrReverse = [];
      //     for (var j = segmentCoordArr.length - 1; j >= 0; j--) {
      //       segmentCoordArrReverse.push(segmentCoordArr[j]);
      //     }
      //     coordinates.push(segmentCoordArrReverse);
      //   } else {
      //     coordinates.push(segmentCoordArr);
      //   }
    }
    callback(err, coordinates);
  });
};