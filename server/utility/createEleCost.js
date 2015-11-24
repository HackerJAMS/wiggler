/***

  Utility Function File:
  Add elevation cost to table "ways" based on elevation in table "nodes".
  elevation cost is for each line segment, which is defined as:
  sum of elevation differences between every two neighbor points on one segment 
  normalized by their distance

***/

var db = require('../db/db.js');
var Q = require('q');
module.exports = function() {
  // ALTER TABLE ways ADD COLUMN eleCost double precision
  // ALTER TABLE ways DROP COLUMN eleCost
  // CREATE INDEX lonlat_idx ON nodes_with_elevation(lon, lat)

  // create an auto-increasing column count in table ways
  // CREATE SEQUENCE seq;
  // ALTER TABLE ways ADD COLUMN count integer UNIQUE;
  // ALTER TABLE ways ALTER COLUMN count SET DEFAULT NEXTVAL('seq');
  // UPDATE ways SET count = NEXTVAL('seq');

  var start = new Date().getTime();
  subSetQuery(33001, 34000);
}

var subSetQuery = function(countStart, countEnd) {

  var queryString = "SELECT gid, length, ST_AsText(ST_Transform(the_geom,4326)) FROM ways WHERE count >=" + countStart + " AND count <=" + countEnd;
  // var queryString = "SELECT gid, length, ST_AsText(ST_Transform(the_geom,4326)) FROM ways WHERE gid = 58713";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways...", err);
    }
    console.log('successfully fetched data!');
    console.log('result', result);
    var counter = 0;
    for (var i = 0; i < result.rows.length; i++) {

      getElevations(i, result)
      .then(getCost)
      .then(function(param) {
        var currentGid = result.rows[param.index].gid;
        db.query("UPDATE ways SET eleCost = " + param.cost + " where gid =" + currentGid, function(err, result) {
          counter++;
          if (err) {
            console.log("i", param.index, "error when update eleCost column...", err);
          } else {
            // if (param.index % 100 === 0) {
              console.log("i", param.index, "successfully updated cost!");
            // }
            if (counter === (countEnd - countStart + 1)) {
              console.log("updating cost is done for count between " + countStart + " and " + countEnd);
              if (countEnd < 42469) {
                countStart = countStart + 1000;
                countEnd = countEnd + 1000;
                subSetQuery(countStart, countEnd);
              } else {
                var end = new Date().getTime();
                console.log("Execution time: " + (end - start) / 1000 + 's');          
              }
            }
          }
        })
        // console.log('gid: ', result.rows[param.index].gid);
      })
      .catch(function(err) {
        console.log('error...', err);
      })
    }
  });
};

// get elevations of points on the ith line segment
var getElevations = function(i, result) { 
  var defer = Q.defer();
  var string = result.rows[i].st_astext;
  var stringArr = string.slice(11, string.length - 1).split(',');
  var elevation = [];
  var count = 0;
  // console.log('getElevations start i', i, "gid", result.rows[i].gid);
  for (var j = 0; j < stringArr.length; j++) {
    (function(j){
      var pi = stringArr[j].split(' ');
      db.query("SELECT * from nodes_with_elevation where lon=" + pi[0] + " and lat=" + pi[1], function(err, nodes) {
        if (err) {
          console.log('error during getElevations',err);
          defer.reject(err);
        }
        // console.log('nodes', nodes.rows[0]);
        elevation[j] = nodes.rows[0].elevation;
        // if(!elevation[j]) {
        //   console.log(j + "th point on " + i + 'th segment is empty')
        // }
        count++;
        if (count === stringArr.length) {
          defer.resolve({index: i, stringArr: stringArr, length: result.rows[i].length, elevation: elevation});
          console.log('getElevations end i', i, "gid", result.rows[i].gid);
        }
      })
    })(j)
  }
  return defer.promise;
}

// calculate cost of each line segment based on elevation change of points on the segment
var getCost = function(param) {
  var defer = Q.defer();
  var cost = 0;
  var count = 0;
  var elevation = param.elevation;
  var stringArr = param.stringArr;
  // console.log('getCosts start i', param.index);
  if (stringArr.length === 2) {
    cost += Math.abs((+elevation[0]) - (+elevation[1])) / param.length;
    defer.resolve({index: param.index, cost: cost});
  } else {
    for (var k = 0; k < stringArr.length - 1; k++) {
      (function(k) {
        var p1 = stringArr[k].split(' ');
        var p2 = stringArr[k + 1].split(' ');
        // db.query("SELECT ST_Distance('POINT(" + p1[0] + p1[1] + ")'::geography,'POINT(" + p2[0] + p2[1] + ")'::geography)", function(err, distance) {

        db.query("SELECT ST_Distance_Spheroid(ST_MakePoint(" + p1[0] + "," + p1[1] + "),ST_MakePoint(" + p2[0] + "," + p2[1] + "),'SPHEROID[\"WGS 84\",6378137,298.257223563]')", function(err, distance) {
          if (err) {
            console.log('error during getCost',err);
            defer.reject(err);
          }
          // the unit of distance is meter, convert it to kilometer
          if (distance.rows[0].st_distance_spheroid !== 0) {
            cost += Math.abs((+elevation[k]) - (+elevation[k + 1])) / (distance.rows[0].st_distance_spheroid / 1000);
          }
          count++;
          console.log(k, 'distance: ', distance.rows[0])
          if (count === (stringArr.length - 1)) {
            console.log('elevation: ', elevation, 'cost: ', cost);
            defer.resolve({index: param.index, cost: cost});
            console.log('getCosts end i', param.index);
          }
        });
      })(k)
    }
  }
  return defer.promise;
}

// ST_Distance_Spheroid has better performance than ST_Distance