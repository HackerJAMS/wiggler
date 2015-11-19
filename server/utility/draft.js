/***

  Utility Function File:
  Minimum Elevation Path from Dijkastra Algorithm
  @param: start - index of the start node
          end - index of the end node
          callback - callback on query result 
  @return: coordinates - nested array of latitude and longitude of points in all line segments
           [[[x1, y1], [x2, y2]], [[x4, y4], [x3, y3], [x2, y2]]]

***/

var db = require('../db/db.js');
module.exports = function(start, end, callback) {
  var queryString = "SELECT gid, length, to_cost, ST_AsText(ST_Transform(the_geom,4326)) FROM ways limit 10";

  db.query(queryString, function(err, result) {
    console.log('err', err);
    console.log('my result is: ', result);
    for (var i = 0; i < result.rows.length; i++) {
      (function(i) {
        var string = result.rows[i].st_astext;
        var stringArr = string.slice(11, string.length - 1).split(',');
        if (stringArr.length === 2) {
          p1 = stringArr[0].split(' ');
          p2 = stringArr[1].split(' ');
          db.query("SELECT * from nodes where (lon=" + p1[0] + " and lat=" + p1[1] + ") or (lon=" + p2[0] + " and lat=" + p2[1] + ")", function(err, result) {
            if (result.rows[0].lon === p1[0] && result.rows[0].lat === p1[1]) {
              var ele1 = result.rows[0].elevation;
              var ele2 = result.rows[1].elevation;
            } else {
              var ele1 = result.rows[1].elevation;
              var ele2 = result.rows[0].elevation;
            }
            to_cost[i] = Math.abs(ele1 - ele2) / result.rows[i].length;
            console.log("i = ", i, to_cost[i]);
          })
        } else {
          var ele = [];
          var distance = [];
          var count = 0;
          // elevation data     
          var p0 = stringArr[0].split(' ');
          db.query("SELECT * from nodes where lon=" + p0[0] + " and lat=" + p0[1], function(err, result) {
            ele[0] = result.rows[0].elevation;
            for (var j = 1; j < stringArr.length; j++) {
              (function(j){
                var pi = stringArr[j].split(' ');
                db.query("SELECT * from nodes where lon=" + pi[0] + " and lat=" + pi[1], function(err, result) {
                  ele[j] = result.rows[0].elevation;
                  count++;
                  if (count === stringArr.length) {
                    for (var k = 0; k < stringArr.length - 1; k++) {
                      (function(k) {
                        var p1 = stringArr[k].split(' ');
                        var p2 = stringArr[k + 1].split(' ');
                        db.query("SELECT ST_Distance('POINT(" + p1[0] + p1[1] + ")'::geography,'POINT(" + p2[0] + p2[1] + ")'::geography)", function(err, distance) {

                          to_cost[i] += Math.abs(ele[k] - ele[k+1]) / distance;
                          console.log("i = ", i, to_cost[i]);

                        });
                      })(k)
                    }
                    
                  }
                })
              })(j) 
            }

          }) 
          

             
        }
      })(i)
    }
    // callback(err, result);
  });
};