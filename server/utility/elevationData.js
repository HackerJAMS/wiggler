var https = require('https');
var http = require('http');

module.exports = function getPathElev(pathArray, callback) {
  var pathStr = flatten(pathArray).join("|")
  var elevApiUrl = "https://maps.googleapis.com/maps/api/elevation/json?locations=" + pathStr + "&key=" + process.env.DB_URL_STR
  https.get(elevApiUrl, function (res) {
    var output = "";
    res.on('data', function (d){
      output += d;
    })
    res.on('end', function(){
      if (JSON.parse(output).results.status === "OVER_QUERY_LIMIT") {
        console.log(JSON.parse(output).results.status)
      } else {
        callback(JSON.parse(output));
        response.send(JSON.parse(output).results)
      }
    })
  }).on('error', function (err) {
    console.log('Error getting elevation data from google' + err.message);
  })
}

function flatten(array) {
  var output = [];
  for (var i = 0; i < array.length; i++) {
    for (var j = 0; j < array[i].length; j++) {
      output.push(array[i][j]);
    }
  }
  return output;
}
