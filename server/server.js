/***

  Server Configuration File

***/
require('dotenv').config({path: __dirname + '/../.env'});
var express = require('express');
var bodyParser = require('body-parser');
var route = require('./route/route.js');
var db = require('./db/db.js');
var db_seq = require('./db/db_sequelize');
var elev = require('./utility/elevationData.js');
// var test = require('./utility/pullAllNodes');
var read = require('./utility/addElevToDb');


db.connect(function(err) {
  if (err) {
    return console.error('could not connect to postgres: ', err);
  } else {
    console.log('connected to postgres database');
  }
});


// var shortestPath = require('./utility/shortestPath.js');
// shortestPath(30, 60, function(err, result){
//   if(err) {
//     console.error('could not obtain the shortest path: ', err);
//   }
//   console.log('result when querying the shortest path', result);
//   // res.send(result);
// });  

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(__dirname + '/../client/'));
 
module.exports = app;

app.post('/route', function(req, res) {
  route(req, res);
});

var port = 3000;
app.listen(port);
console.log('Server now listening on port ' + port);