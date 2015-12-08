require('dotenv').config({path: __dirname + '/../.env'});
var express = require('express');
var db = require('./db/db.js');
var bodyParser = require('body-parser');
var loopRoute = require('./route/loopRoute');
db.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres: ', err);
  } else {
    console.log('connected to postgres database');
  }
});

var app = express();
app.use(bodyParser.json());


// loopRoute();

//// populate the database with cost variables for the routing algorithm
//// not needed to run the app - just needs to run on db setup
// var calcDirCost = require('./db/calcDirectionalCost');
// calcDirCost();
// var createEleCost = require('./db/createEleCost.js');
// createEleCost(); 
// var elev_db = require('./db/createElevationDb');
// var calcHikeBikeCost = require('./db/calcHikeBikeCost');
  // acceptable arguments are "hike" and "bike"
// calcHikeBikeCost("hike");





// module.exports = app;

// var port = process.env.PORT || 3030;
// app.listen(port);
// console.log('Server now listening on port ' + port);