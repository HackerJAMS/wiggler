// Database Build
// Usage: This server is not used to run the app, it is primarily for one-time 
// database build and populate functions such as:
// - getting and saving elevation data for all the nodes in the database from google elevation API
// - calculating various measures of cost for the ways of the graph in order to run custom Dijkstra's path-finding

require('dotenv').config({path: __dirname + '/../.env'});
var express = require('express');
var db = require('./db/db.js');
var bodyParser = require('body-parser');
var loopRoute = require('./route/loop_route');

db.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres: ', err);
  } else {
    console.log('connected to postgres database');
  }
});

var app = express();
app.use(bodyParser.json());


//// not needed to run the app - just needs to run on db setup

// var createEleCost = require('./db/calculate_elevation_cost.js');
// createEleCost(); 
// var calcHikeBikeCost = require('./db/calculate_hike_bike_cost');
//// acceptable arguments are "hike" and "bike"
// calcHikeBikeCost("hike");
// var elevation_nodes_db = require('./db/create_elevation_nodes');
// elevation_nodes_db();

