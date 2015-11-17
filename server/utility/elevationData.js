var https = require('https');

module.exports = function getPathElev(pathArray, callback) {
  var pathStr = flatten(pathArray).join("|")
  var elevApiUrl = "https://maps.googleapis.com/maps/api/elevation/json?locations=" + pathStr + "&key=" + process.env.ELEVATION_API_KEY
  https.get(elevApiUrl, function (res) {
    console.log(res.statusCode, res.data);
    res.on('data', function (d){
      // process.stdout.write(d);
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
