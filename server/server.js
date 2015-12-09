/***

  Server Configuration File

***/
require('dotenv').config({path: __dirname + '/../.env'});
var express = require('express');
var bodyParser = require('body-parser');
var route = require('./route/route.js');
var db = require('./db/db.js');
var db_seq = require('./db/db_sequelize');

var resample = require('./resample_elevation/resample_elevation.js');

// db.connect(function(err) {
//   if (err) {
//     return console.error('could not connect to postgres: ', err);
//   } else {
//     console.log('connected to postgres database');
//   }
// });

// var minElevationPath = require('./utility/minElevationPath.js');
// minElevationPath(30, 60, function(err, result){
//   if(err) {
//     console.error('could not obtain the minimum elevation path: ', err);
//     res.send(err);
//   } else {
//     console.log('result when querying the minimum elevation path: ', result);
//     res.send(result);
//   }
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

app.post('/elevationquery', function(req,res){
  // console.log('in the server-------->', req.body.coordinates);
  resample(req, res);
})

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Server now listening on port ' + port);
