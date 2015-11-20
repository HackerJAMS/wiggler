var db = require('../db/db.js');
var seq = require('../db/db_sequelize');
var polyUtil = require('polyline-encoded');
var Sequelize = require('sequelize');
var https = require('https')


var start;
var queryDbforGoogle = function(cb) {
  start = new Date().getTime();
  var queryString = "SELECT a.* FROM nodes a LEFT JOIN elevation b ON round(a.lat,5) = round(b.lat,5) AND round(a.lon,5)=round(b.lon,5) WHERE  b.lon is null LIMIT 500;";
  db.query(queryString, function(err, result) {
    if (err) console.error(err);
    if (result.rows.length > 0){
      cb(result);
    } else {
      console.log("no results returned from query");
      return;
    }
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
  callGoogle(nodeGroups, result.rows);
}

function callGoogle(nodeGroups, rows) {
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
              process.stdout.write(d);
            })
            res.on('end', function() {
              // fs.writeFile("../test_" + index+".json", output, function(err){
              //   if (err) console.log("there was an error writing to file");
              //   console.log("successfully wrote file!");
              // })
              if (JSON.parse(output).results.status === "OVER_QUERY_LIMIT") {
                console.log(JSON.parse(output).results.status)
              } else {
                console.log("rows back from google",JSON.parse(output).results.length );
                popDB(JSON.parse(output).results, rows)
              }
            });
          } else {
            console.log("there was an error", res.statusCode);
            res.on('data', function (d){
              process.stdout.write(d);
            })
          }
        }).on('error', function(err) {
          console.log('Error getting elevation data from google' + err.message);
        })
      // }, 0)
    })(i);
  }
}

var saveElevationData = function(result){
  console.log("saved result length", result.length);
  var Elevation = seq.sequelize.define('Elevation', seq.elevation.config, seq.elevation.options);
  Elevation.sync().then(function(){
    Elevation.bulkCreate(result).then(function (){
      console.log("success creating records");
    });
    // setTimeout(queryDbforGoogle(splitNodes),500);
  })
}
function roundCoords (num) {
  return Math.round(num * 100000) / 100000
}
function popDB(results, rows) {
  bulkSave = [];
  for (var index=0; index< Object.keys(results).length; index++){
    bulkSave.push({lat: roundCoords(results[index].location.lat),lon: roundCoords(results[index].location.lng), elevation: results[index].elevation});
  }
  saveElevationData(bulkSave);
}

queryDbforGoogle(splitNodes);