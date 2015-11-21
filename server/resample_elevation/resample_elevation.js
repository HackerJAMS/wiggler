module.exports = function(req, response) {
  pathStr = polyUtil.encode(req.body); //nodeGroups[index].join('|');

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
