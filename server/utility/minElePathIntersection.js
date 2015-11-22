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
var Q = require('q');
var process = require('./processRes.js');
var elev = require('./elevationData.js');

module.exports = function(start, end, callback) {
  // var queryString = "SELECT gid, length, source, target, x1, y1, x2, y2, e1, elevation as e2, a.numofuse as numofuse1, nodes.numofuse as numofuse2 from (SELECT gid, length, source, target, x1, y1, elevation as e1, x2, y2, numofuse from ways, nodes where lon=x1 and lat=y1 and numofuse > 1) a, nodes where lon=x2 and lat=y2 and nodes.numofuse > 1;"
        db.query("UPDATE ways SET eleCost = " + param.cost + " where gid =" + currentGid,

  var queryString = "UPDATE waysSELECT gid, elevation as e1 from ways, nodes where lon=x1 and lat=y1 and numofuse > 1;"

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways...", err);
    }
    console.log('successfully fetched data!');
    console.log('result', result);
    for (var i = 0; i < result.rows.length; i++) {
      // getCost(i, result)
      // .then(function(param) {
      //   var currentGid = result.rows[param.index].gid;
      //   db.query("UPDATE ways SET eleCost = " + param.cost + " where gid =" + currentGid, function(err, result) {
      //     if (err) {
      //       console.log("error when update eleCost column...", err);
      //     } else {
      //       console.log("i", param.index, "successfully updated cost!");
      //     }
      //   })
      //   // console.log('gid: ', result.rows[param.index].gid);
      // })
      // .catch(function(err) {
      //   console.log('error...', err);
      // })
    }
  });
};

// calculate cost of each line segment based on elevation change of points on the segment
var getCost = function(i, result) {
  var defer = Q.defer();
  var string = result.rows[i].;  
  var cost = 0;
  var count = 0;

  cost += Math.abs((+elevation[0]) - (+elevation[1])) / param.length;
  defer.resolve({index: param.index, cost: cost});
  return defer.promise;  
};




















