/***

  Server Configuration File

***/

// load environment variables
require('dotenv').config({path: __dirname + '/../.env'});

// include db connection module
var db = require('./db/db.js');

// include middleware modules
var express = require('express');
var bodyParser = require('body-parser');

// set up route handlers
var route = require('./route/route.js');
var loop = require('./route/loop_route.js')
var resample = require('./resample_elevation/resample_elevation.js');

// connect to postgresql server
db.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres: ', err);
  } else {
    console.log('connected to postgres database');
  }
});

// var minHikeBike = require('./utility/minimum_hike_bike_path.js');
// minHikeBike(23055, 6346, "hike", function(err, result){
//   if(err) {
//     console.error('could not obtain the minimum elevation path: ', err);
//   } else {
//     console.log('result when querying the minimum elevation path: ', result[0]);
//   }
// }); 

var app = express();

// include middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/../client/'));



// http routes 
app.post('/route', function(req, res) {
  route(req, res);
});

app.post('/elevationquery', function(req,res){
  resample(req, res);
})

app.post('/loop', function (req, res){
  loop(req, res);
});

// 
var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server now listening on port ' + port);

module.exports = app;
