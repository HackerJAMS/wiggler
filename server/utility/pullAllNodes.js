var db = require('../db/db.js');
var https = require('https');
var fs = require('fs');
var polyUtil = require('polyline-encoded');
var Sequelize = require('sequelize');
var seq = require('../db/db_sequelize');
var start;
var queryDbforGoogle = function(cb) {
  start = new Date().getTime();
  var queryString = "SELECT * FROM nodes WHERE elevation IS NULL AND numofuse > 1 LIMIT 10000;";
  db.query(queryString, function(err, result) {
    if (err) console.error(err);
    cb(result);
  })
};


function splitNodes(result) {
  console.log(result.rows.length);
  var nodeObj = {};
  // google api will only accept 512 nodes per request
  var pointsPerReq = 500;
  // populate obj with nodes
  for (var i = 0; i < result.rows.length; i++) {
    if (!nodeObj[result.rows[i].id]) {
      nodeObj[result.rows[i].id] = {};
    }
    nodeObj[result.rows[i].id].coords = [Math.round(Number(result.rows[i].lat) * 100000) / 100000, Math.round(Number(result.rows[i].lon) * 100000) / 100000];
  }

  var keys = Object.keys(nodeObj);
  var nodeGroups = {}
  for (var i = 0; i < keys.length / pointsPerReq; i++) {
    nodeGroups[i] = [];
    for (var j = i * pointsPerReq; j < (i + 1) * pointsPerReq; j++) {
      if (keys[j]) {
        nodeGroups[i].push(nodeObj[keys[j]].coords)
      }
    }
  };
  callGoogle(nodeGroups);
}

function callGoogle(nodeGroups) {
  for (var i = 0; i < Object.keys(nodeGroups).length; i++) { //Object.keys(nodeGroups).length
    (function(index) {
      // setTimeout(function() {
        // encode coordinates array using google's polyline encoding algorithm
        pathStr = polyUtil.encode(nodeGroups[index]); //nodeGroups[index].join('|');
        var options = {
          host: 'maps.googleapis.com',
          path: '/maps/api/elevation/json?locations=enc:' + pathStr,
          auth: process.env.ELEVATION_API_KEY
        };
        https.get(options, function(res) {
          if (res.statusCode === 200) {
            var output = "";
            res.on('data', function(d) {
              output += d;
            })
            res.on('end', function() {
              // fs.writeFile("../test_" + index+".json", output, function(err){
              //   if (err) console.log("there was an error writing to file");
              //   console.log("successfully wrote file!");
              // })
              popDB(JSON.parse(output).results)
            });
          } else {
            console.log("there was an error", res.statusCode);
          }
        }).on('error', function(err) {
          console.log('Error getting elevation data from google' + err.message);
        })
      // }, 0)
    })(i);
  }
}

  var addElevation = function(results) {
    var notFound = 0;
    for (var i = 0; i < results.length; i++) { // results.length
      (function(index) {

        var update = "UPDATE ROUND_NODES SET elevation=" + results[index].elevation + 
                      "WHERE round_lat="+roundCoords(results[index].location.lat) +
                      "AND round_lon="+roundCoords(results[index].location.lng) +";";

        db.query(update, function (err, queryResult){
          if (err) {
            console.error(err);
          } else {
            // console.log(Object.keys(queryResult));
            if (index === results.length - 1) {
              console.log("number not found", notFound);
              var stop = new Date().getTime();
              console.log("seconds for 500 records", (stop-start)/1000)
            }
            if (queryResult.rows[0] < 1) notFound++; 
          }
        })
        // RoundNode.update({
        //     elevation: results[index].elevation
        //   }, {
        //     where: {
        //       round_lat: roundCoords(results[index].location.lat),
        //       round_lon: roundCoords(results[index].location.lng),
        //       elevation: null
        //     }
        //   })
        //   .then(function(nodes) {
        //     if (nodes[0] < 1) notFound++; //notFound.push([roundCoords(results[index].location.lat), roundCoords(results[index].location.lng)]);
        //     if (index === results.length - 1) {
        //       console.log("number not found", notFound);
        //       var stop = new Date().getTime();
        //       console.log("seconds for 500 records", (stop-start)/1000)

        //     }
        //   })
      })(i)
    }
  }



  var RoundNode = seq.sequelize.define('RoundNode', seq.model.config, seq.model.options);

  function popDB(results) {
    // RoundNode.sync().then(function() {
      console.log("sequelize db syncd");
      addElevation(results)
    // });
  }

  function roundCoords (num) {
    return Math.round(num * 100000) / 100000
  }

  queryDbforGoogle(splitNodes);


  // function flatten(array) {
  //   var output = [];
  //   for (var i = 0; i < array.length; i++) {
  //     for (var j = 0; j < array[i].length; j++) {
  //       output.push(array[i][j]);
  //     }
  //   }
  //   // return output;
  // }
