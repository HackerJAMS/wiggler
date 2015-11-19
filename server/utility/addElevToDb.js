var Sequelize = require('sequelize');
var Node = require('../db/db_sequelize');
var fs = require('fs');

gmaps_data = function (file_num, cb){
  fs.readFile('../test_'+file_num+'.json', 'utf8', function (err, data){
    if (err) console.error(err);
    obj = JSON.parse(data);
    cb(obj.results);
  });
}

function addElevation (results) {
  for (var i=0; i<results.length; i++) {
    (function (index){
      Node.find({where: {lat: results[index].lat, lon:results[index].lat}})
    })(i)
  }
}

