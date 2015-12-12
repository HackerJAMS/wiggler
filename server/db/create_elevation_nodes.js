var db = require('../db/db.js');
var seq = require('../db/db_sequelize');
var polyUtil = require('polyline-encoded');
var Sequelize = require('sequelize');
var https = require('https')
var start;

// counters here to prevent duplicate requests for the same node's elevation data
var counterStart = 1;
var counterEnd = 10000;

module.exports = {}
module.exports.populateElevationData = function() {
  start = new Date().getTime();
  console.log("start and end", counterStart, counterEnd);
  var queryString = "select * from nodes_with_elevation where counter BETWEEN " + counterStart + "AND " + counterEnd + " limit 10000;";

  db.query(queryString, function(err, result) {
    if (err) console.error(err);
    console.log("records returned by query", result.rows.length);
    if (result.rows.length > 0) {
      splitNodes(result);
    } else {
      console.log("no results returned from query");
      return;
    }
  })
};

function splitNodes(result) {
  var nodeObj = {};
  // google api will only accept 512 nodes per request
  var pointsPerReq = 500;
  // populate obj with nodes
  for (var i = 0; i < result.rows.length; i++) {
    if (!nodeObj[result.rows[i].id]) {
      nodeObj[result.rows[i].id] = {};
    }
    nodeObj[result.rows[i].id].coords = [Number(result.rows[i].round_lat), Number(result.rows[i].round_lon)];
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
  callGoogle(nodeGroups, result.rows);
}

function callGoogle(nodeGroups, rows) {
  for (var i = 0; i < Object.keys(nodeGroups).length; i++) {
    setTimeout((function(index) {
      // encode coordinates array using google's polyline encoding algorithm
      pathStr = polyUtil.encode(nodeGroups[index]);
      console.log('maps.googleapis.com/maps/api/elevation/json?locations=enc:' + pathStr);
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
            if (JSON.parse(output).results.error_message === "OVER_QUERY_LIMIT") {
              console.log(JSON.parse(output).results.status)
            } else {
              if (JSON.parse(output).results.length === 0) {
                console.log(JSON.parse(output));
              } else {
                popDB(JSON.parse(output).results, rows)
              }
            }
          });
        } else {
          console.log("there was an error getting elevation data from google", res.statusCode);
          res.on('data', function(d) {
            process.stdout.write(d);
          });
        }
      }).on('error', function(err) {
        console.log('Error getting elevation data from google' + err.message);
      })
      if (index === Object.keys(nodeGroups).length - 1) {
        // if processing the last group of 500 nodes, increment the counter and call the function again
        // 
        console.log("success creating records from count = ", counterStart, "to ", counterEnd);
        counterStart = counterEnd;
        counterEnd = counterStart + 10000;
        setTimeout(module.exports.populateElevationData(), 5000);
      }
    })(i), 3000);
  }
}
var Elevation = seq.sequelize.define('Elevation', seq.elevation.config, seq.elevation.options);

var saveElevationData = function(result) {
  if (result.length > 0) {
    Elevation.sync().then(function() {
      // save 500 records to the database at a time
      Elevation.bulkCreate(result).then(function() {
        console.log("success creating records");
      });
    })

  } else {
    // no results to save
    console.log("No results saved to the database");
  }
}

function roundCoords(num) {
  return Math.round(num * 100000) / 100000
}

function popDB(results, rows) {
  bulkSave = [];
  for (var index = 0; index < Object.keys(results).length; index++) {
    bulkSave.push({
      lat: results[index].location.lat,
      lon: results[index].location.lng,
      round_lat: roundCoords(results[index].location.lat),
      round_lon: roundCoords(results[index].location.lng),
      elevation: results[index].elevation
    });
  }
  saveElevationData(bulkSave);
}
