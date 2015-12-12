// Request to google elevation API
// Usage: when plotting our cusom paths on the front-end map and data visualizations
// we resample the path so that the datapoints are evenly distributed along the path
// and we have more detailed elevation data


var polyUtil = require('polyline-encoded');
var https = require('https');
module.exports = function(req, response) {

  var coordinates = req.body.coordinates.map(function (point){
    return [point[1], point[0]];
  })
  pathStr = polyUtil.encode(coordinates); //nodeGroups[index].join('|');

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
        if (JSON.parse(output).results.status === "OVER_QUERY_LIMIT") {
          console.log(JSON.parse(output).results.status)
        } else {
          console.log("rows back from google", JSON.parse(output).results.length);
          response.send(JSON.parse(output).results)
        }
      });
    } else {
      console.log("there was an error", res.statusCode);
      res.on('data', function(d) {
        response.status(301).send("there was an error querying google's elevation API");
        process.stdout.write(d);
      })
    }
  }).on('error', function(err) {
    console.log('Error getting elevation data from google' + err.message);
    response.status("error, something's wrong");
  })
}
