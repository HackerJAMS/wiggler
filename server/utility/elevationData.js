var https = require('https');
var polyUtil = require('polyline-encoded');


module.exports = function getPathElev(pathArray, callback) {
  var numsArray = flatten(pathArray).map(function (d) {
    var arr = [];
    d.forEach(function (e){
      arr.push(Number(e));
    })
    return arr;
  })
  
  if (numsArray.length > 512) {
    numsArray = numsArray.slice(0, 511);
  }


  var pathStr = polyUtil.encode(numsArray);
  var options = {
    host: 'maps.googleapis.com',
    path: '/maps/api/elevation/json?locations=enc:' + pathStr,
    auth: process.env.ELEVATION_API_KEY
  };
  // console.log(flatten(pathArray));
  // console.log(options.path);
  https.get(options, function (res) {
    var output = "";
    res.on('data', function (d){
      output += d;
    })
    res.on('end', function(){
      if (JSON.parse(output).results.status === "OVER_QUERY_LIMIT") {
        console.log(JSON.parse(output).results.status)
      } else {
        callback(JSON.parse(output));
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
