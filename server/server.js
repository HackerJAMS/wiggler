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

var app = express();

// include middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/../client/'));

module.exports = app;

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
