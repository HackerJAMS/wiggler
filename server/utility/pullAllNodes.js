var db = require('../db/db.js');
var http = require('http');
var https = require('https');
var fs = require('fs');
// var L = require('leaflet');
var polyUtil = require('polyline-encoded');

var queryDbforGoogle = function (cb) {
  var start = new Date().getTime();
  var queryString = "SELECT * FROM nodes;";
  db.query(queryString, function(err, result) {
    if (err) console.err(err);
    cb(result);  
  })
};

function getPathElev(result) {
  var nodeObj = {};
  var pointsPerReq = 500;
  // populate obj with nodes
  for (var i = 0; i< result.rows.length; i++){
    if(!nodeObj[result.rows[i].id]){
      nodeObj[result.rows[i].id] = {};
    } 
    nodeObj[result.rows[i].id].coords =[Math.round(Number(result.rows[i].lat) *100000)/100000, Math.round(Number(result.rows[i].lon)*100000)/100000];
  }
  // split into groups of 500 to comply with google's points/req limit
  var keys = Object.keys(nodeObj);
  var nodeGroups = {}
  for (var i = 0; i< keys.length/pointsPerReq; i++) {
    nodeGroups[i] = [];
    for (var j=i*pointsPerReq; j< (i+1)*pointsPerReq; j++){
      if (keys[j]) {
        nodeGroups[i].push(nodeObj[keys[j]].coords)
      }
    }
    fs.writeFile("../nodeGroups.json", JSON.stringify(nodeGroups), function(err){
      if (err) console.log("there was an errpr", err);
    })
  }

  for (var i = 0; i< Object.keys(nodeGroups).length; i++){ //Object.keys(nodeGroups).length
    (function (index){
      pathStr =  polyUtil.encode(nodeGroups[index]); //nodeGroups[index].join('|');
      var elevApiUrl = "https://maps.googleapis.com/maps/api/elevation/json?locations=enc:" + pathStr + "&key=" + process.env.ELEVATION_API_KEY;
      // console.log(elevApiUrl);
      var options = {
        host: 'maps.googleapis.com',
        path: '/maps/api/elevation/json?locations=enc:' + pathStr,
        auth: process.env.ELEVATION_API_KEY
      };
      https.get(options, function (res) {
        if (res.statusCode===200){
          var output = "";
          res.on('data', function (d){
            output += d;
          })
          res.on('end', function(){
            fs.writeFile("../test_" + index+".json", output, function(err){
              if (err) console.log("there was an error writing to file");
              console.log("successfully wrote file!");
            });
          })
        } else {
          console.log("there was an error", res.statusCode);
        }
      }).on('error', function (err) {
        console.log('Error getting elevation data from google' + err.message);
      })
    })(i);
  }
}

// queryDbforGoogle(getPathElev);

// function flatten(array) {
//   var output = [];
//   for (var i = 0; i < array.length; i++) {
//     for (var j = 0; j < array[i].length; j++) {
//       output.push(array[i][j]);
//     }
//   }
//   // return output;
// }

// var queryDb = function (cb) {
//   var start = new Date().getTime();
//   var queryString = "SELECT * FROM nodes;";
//   db.query(queryString, function(err, result) {
//     if (err) console.err(err);
//     var obs = {};
//     for (var i = 0; i< result.rows.length; i++){
//       if(!obs[result.rows[i].id]){
//         obs[result.rows[i].id] = {};
//       } 
//       obs[result.rows[i].id].lat =result.rows[i].lat;
//       obs[result.rows[i].id].lon =result.rows[i].lon;
//       if (i===result.rows.length-1) {
//         cb(obs)
//       }
//     }    
//   })
// };
// function getUSGS(nodeObj) {
//   var data = [];
//   var keys = Object.keys(nodeObj);
//   var completedReq = 0;
//   var resp_back = 0;
//   for (var i = 0; i < keys.length; i++){
//     (function (index) {
//       url = "http://ned.usgs.gov/epqs/pqs.php\?x\=" + nodeObj[keys[index]].lon+ "\&y\=" + nodeObj[keys[index]].lat + "\&units\=Meters\&output=json";

//       http.get(url, function (res){
//         console.log("get req fired #", index);
//         if (res.statusCode === 200){
//           var output = "";
//           res.on('data', function (d){
//             output += d;
//           });
//           res.on('end', function (){
//             var parsed = JSON.parse(output);
//             nodeObj[keys[index]] ? nodeObj[keys[index]].elevation = parsed.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation : true;
//             if (completedReq === keys.length-1) {
//               console.log(nodeObj[keys[index]]);
//             }
//           });
//         } else {
//           console.log(res.statusCode, "error querying usds");
//         }
//       })
//     })(i);
//   }
// }