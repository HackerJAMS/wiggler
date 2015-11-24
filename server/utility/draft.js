// module.exports = function(start, end, callback) {
//   // var queryString = "SELECT gid, length, source, target, x1, y1, x2, y2, e1, elevation as e2, a.numofuse as numofuse1, nodes.numofuse as numofuse2 from (SELECT gid, length, source, target, x1, y1, elevation as e1, x2, y2, numofuse from ways, nodes where lon=x1 and lat=y1 and numofuse > 1) a, nodes where lon=x2 and lat=y2 and nodes.numofuse > 1;"
//   db.query("UPDATE ways SET eleCost = " + param.cost + " where gid =" + currentGid,

//   var queryString = "UPDATE ways SELECT gid, elevation as e1 from ways, nodes where lon=x1 and lat=y1 and numofuse > 1;"

// };

// /***

//   Utility Function File:
//   Add elevation cost to table "ways" based on elevation in table "nodes".
//   elevation cost is for each line segment, which is defined as:
//   sum of elevation differences between every two neighbor points on one segment 
//   normalized by their distance

// ***/

// var db = require('../db/db.js');
// var Q = require('q');
// module.exports = function() {
//   // ALTER TABLE ways ADD COLUMN eleCost double precision
//   // ALTER TABLE ways DROP COLUMN eleCost
//   // CREATE INDEX lonlat_idx ON nodes_with_elevation(lon, lat)
//   var start = new Date().getTime();

//   var queryString = "SELECT gid, length, ST_AsText(ST_Transform(the_geom,4326)) FROM ways limit 10";

//   db.query(queryString, function(err, result) {
//     if(err) {
//       console.log("err when query table ways...", err);
//     }
//     console.log('successfully fetched data!');
//     // console.log('result', result);
//     var counter = 0;
//     for (var i = 0; i < result.rows.length; i++) {

//       getElevations(i, result)
//       .then(getCost)
//       .then(function(param) {
//         var currentGid = result.rows[param.index].gid;
//         db.query("UPDATE ways SET eleCost = " + param.cost + " where gid =" + currentGid, function(err, result) {
//           if (err) {
//             console.log("error when update eleCost column...", err);
//           } else {
//             // if (param.index % 100 === 0) {
//               console.log("i", param.index, "successfully updated cost!");
//             // }
//             counter++;
//             if (counter === 42469) {
//               console.log("updating cost is done!");
//               var end = new Date().getTime();
//               console.log("Execution time: " + (end - start) / 1000 + 's');
//             }
//           }
//         })
//         // console.log('gid: ', result.rows[param.index].gid);
//       })
//       .catch(function(err) {
//         console.log('error...', err);
//       })
//     }
//   });
// };

// // get elevations of points on the ith line segment
// var getElevations = function(i, result) { 
//   var defer = Q.defer();
//   var string = result.rows[i].st_astext;
//   var stringArr = string.slice(11, string.length - 1).split(',');
//   var elevation = [];
//   var count = 0;
//   console.log('getElevations start i', i, "gid", result.rows[i].gid);
//   for (var j = 0; j < stringArr.length; j++) {
//     (function(j){
//       var pi = stringArr[j].split(' ');
//       db.query("SELECT * from nodes_with_elevation where lon=" + pi[0] + " and lat=" + pi[1], function(err, nodes) {
//         if (err) {
//           console.log('error during getElevations',err);
//           defer.reject(err);
//         }
//         // console.log('nodes', nodes.rows[0]);
//         elevation[j] = nodes.rows[0].elevation;
//         // if(!elevation[j]) {
//         //   console.log(j + "th point on " + i + 'th segment is empty')
//         // }
//         count++;
//         if (count === stringArr.length) {
//           defer.resolve({index: i, stringArr: stringArr, length: result.rows[i].length, elevation: elevation});
//           console.log('getElevations end i', i, "gid", result.rows[i].gid);
//         }
//       })
//     })(j)
//   }
//   return defer.promise;
// }

// // calculate cost of each line segment based on elevation change of points on the segment
// var getCost = function(param) {
//   var defer = Q.defer();
//   var cost = 0;
//   var count = 0;
//   var elevation = param.elevation;
//   var stringArr = param.stringArr;
//   console.log('getCosts start i', param.index);
//   if (stringArr.length === 2) {
//     cost += Math.abs((+elevation[0]) - (+elevation[1])) / param.length;
//     defer.resolve({index: param.index, cost: cost});
//   } else {
//     for (var k = 0; k < stringArr.length - 1; k++) {
//       (function(k) {
//         var p1 = stringArr[k].split(' ');
//         var p2 = stringArr[k + 1].split(' ');
//         // db.query("SELECT ST_Distance('POINT(" + p1[0] + p1[1] + ")'::geography,'POINT(" + p2[0] + p2[1] + ")'::geography)", function(err, distance) {

//         db.query("SELECT ST_Distance_Spheroid(ST_MakePoint(" + p1[0] + "," + p1[1] + "),ST_MakePoint(" + p2[0] + "," + p2[1] + "),'SPHEROID[\"WGS 84\",6378137,298.257223563]')", function(err, distance) {
//           if (err) {
//             // console.log(err);
//             defer.reject(err);
//           }
//           // the unit of distance is meter, convert it to kilometer
//           cost += Math.abs((+elevation[k]) - (+elevation[k + 1])) / (distance.rows[0].st_distance_spheroid / 1000);
//           count++;
//           // console.log(k, 'distance: ', distance.rows[0])
//           if (count === (stringArr.length - 1)) {
//             // console.log('elevation: ', elevation, 'cost: ', cost);
//             defer.resolve({index: param.index, cost: cost});
//             console.log('getCosts end i', param.index);
//           }
//         });
//       })(k)
//     }
//   }
//   return defer.promise;
// }

// ST_Distance_Spheroid has better performance than ST_Distance

//  /***

//   Utility Function File:
//   Minimum Elevation Path from Dijkastra Algorithm
//   @param: start - index of the start node
//           end - index of the end node
//           callback - callback on query result 
//   @return: coordinates - nested array of latitude and longitude of points in all line segments
//            [[[x1, y1], [x2, y2]], [[x4, y4], [x3, y3], [x2, y2]]]

// ***/

// var db = require('../db/db.js');
// module.exports = function(start, end, callback) {
//   var queryString = "SELECT gid, length, to_cost, ST_AsText(ST_Transform(the_geom,4326)) FROM ways limit 10";

//   db.query(queryString, function(err, result) {
//     console.log('err', err);
//     console.log('my result is: ', result);
//     for (var i = 0; i < result.rows.length; i++) {
//       (function(i) {
//         var string = result.rows[i].st_astext;
//         var stringArr = string.slice(11, string.length - 1).split(',');
//         if (stringArr.length === 2) {
//           p1 = stringArr[0].split(' ');
//           p2 = stringArr[1].split(' ');
//           db.query("SELECT * from nodes where (lon=" + p1[0] + " and lat=" + p1[1] + ") or (lon=" + p2[0] + " and lat=" + p2[1] + ")", function(err, result) {
//             if (result.rows[0].lon === p1[0] && result.rows[0].lat === p1[1]) {
//               var ele1 = result.rows[0].elevation;
//               var ele2 = result.rows[1].elevation;
//             } else {
//               var ele1 = result.rows[1].elevation;
//               var ele2 = result.rows[0].elevation;
//             }
//             to_cost[i] = Math.abs(ele1 - ele2) / result.rows[i].length;
//             console.log("i = ", i, to_cost[i]);
//           })
//         } else {
//           var ele = [];
//           var distance = [];
//           var count = 0;
//           // elevation data     
//           var p0 = stringArr[0].split(' ');
//           db.query("SELECT * from nodes where lon=" + p0[0] + " and lat=" + p0[1], function(err, result) {
//             ele[0] = result.rows[0].elevation;
//             for (var j = 1; j < stringArr.length; j++) {
//               (function(j){
//                 var pi = stringArr[j].split(' ');
//                 db.query("SELECT * from nodes where lon=" + pi[0] + " and lat=" + pi[1], function(err, result) {
//                   ele[j] = result.rows[0].elevation;
//                   count++;
//                   if (count === stringArr.length) {
//                     for (var k = 0; k < stringArr.length - 1; k++) {
//                       (function(k) {
//                         var p1 = stringArr[k].split(' ');
//                         var p2 = stringArr[k + 1].split(' ');
//                         db.query("SELECT ST_Distance('POINT(" + p1[0] + p1[1] + ")'::geography,'POINT(" + p2[0] + p2[1] + ")'::geography)", function(err, distance) {

//                           to_cost[i] += Math.abs(ele[k] - ele[k+1]) / distance;
//                           console.log("i = ", i, to_cost[i]);

//                         });
//                       })(k)
//                     }
                    
//                   }
//                 })
//               })(j) 
//             }

//           }) 
          

             
//         }
//       })(i)
//     }
//     // callback(err, result);
//   });
// };