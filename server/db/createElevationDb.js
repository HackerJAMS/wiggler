var db = require('../db/db.js');
var seq = require('../db/db_sequelize');
var polyUtil = require('polyline-encoded');
var Sequelize = require('sequelize');
var https = require('https')
var start;
var counterStart = 1846500;
var counterEnd = 1847000;

var queryDbforGoogle = function() {
  start = new Date().getTime();
  console.log("start and end", counterStart, counterEnd);
  var queryString = "select * from nodes_no_el where elevation is null;" //where counter BETWEEN " + counterStart + "AND " +counterEnd+ " limit 500;";
  
  db.query(queryString, function(err, result) {
    if (err) console.error(err);
    console.log("records returned by query",result.rows.length);
    if (result.rows.length > 390){
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
  var pointsPerReq = 200;
  // populate obj with nodes
  for (var i = 0; i < result.rows.length; i++) {
    if (!nodeObj[result.rows[i].id]) {
      nodeObj[result.rows[i].id] = {};
    }
    nodeObj[result.rows[i].id].coords = [Number(result.rows[i].round_lat),Number(result.rows[i].round_lon)];
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
  console.log("coords loaded as", nodeGroups[0][0]);
  callGoogle(nodeGroups, result.rows);
}

function callGoogle(nodeGroups, rows) {
  for (var i = 0; i < Object.keys(nodeGroups).length; i++) { //Object.keys(nodeGroups).length
    setTimeout((function(index) {
      // setTimeout(function() {
        // encode coordinates array using google's polyline encoding algorithm
        pathStr = polyUtil.encode(nodeGroups[index]); //nodeGroups[index].join('|');
        // console.log('maps.googleapis.com/maps/api/elevation/json?locations=enc:' + pathStr);
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
              if (JSON.parse(output).results.error_message === "OVER_QUERY_LIMIT") {
                console.log(JSON.parse(output).results.status)
              } else {
                if (JSON.parse(output).results.length===0){
                  console.log(JSON.parse(output));
                } else {
                  popDB(JSON.parse(output).results, rows)
                }
              }
            });
          } else {
            console.log("there was an error", res.statusCode);
            res.on('data', function (d){
              process.stdout.write(d);
            })
            res.on('end', function (){
              // setTimeout(queryDbforGoogle(splitNodes),300000);
            })
          }
        }).on('error', function(err) {
          console.log('Error getting elevation data from google' + err.message);
        })
      // }, 0)
    })(i),3000);
  }
}
var Elevation = seq.sequelize.define('Elevation', seq.elevation.config, seq.elevation.options);

var saveElevationData = function(result){
  console.log("saved result length", result.length);
  if (result.length > 0) {
    Elevation.sync().then(function(){
      Elevation.bulkCreate(result).then(function (){
        console.log("success creating records");
      });
    })
    counterStart=counterEnd;
    counterEnd = counterStart + 500;
    // setTimeout(queryDbforGoogle(splitNodes),5000);
  } else {
    var query = "INSERT INTO empty_counters (counterStart, counterEnd) VALUES ("+ counterStart+","+counterEnd+");";
    db.query(query, function (err, result){
      if (err) console.log(err);
      console.log("records not returned from google");
      counterStart=counterEnd;
      counterEnd = counterStart + 500;
      // setTimeout(queryDbforGoogle(splitNodes),5000);
    })
  }
}
function roundCoords (num) {
  return Math.round(num * 100000) / 100000
}
function popDB(results, rows) {
  bulkSave = [];
  for (var index=0; index< Object.keys(results).length; index++){
    bulkSave.push({lat: results[index].location.lat, lon: results[index].location.lng, round_lat: roundCoords(results[index].location.lat),round_lon: roundCoords(results[index].location.lng), elevation: results[index].elevation});
  }
  saveElevationData(bulkSave);
}
// console.log("hello");
queryDbforGoogle();