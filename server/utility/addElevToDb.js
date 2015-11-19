var Sequelize = require('sequelize');
var db = require('../db/db_sequelize');
var fs = require('fs');


gmaps_data = function (file_num, cb){
  fs.readFile('../test_'+file_num+'.json', 'utf8', function (err, data){
    if (err) console.error(err);
    obj = JSON.parse(data);
    cb(obj.results);
  });
}
var notFound = []
function addElevation (results) {
  for (var i=0; i<results.length; i++) {  // results.length
    (function (index){
      RoundNode.update({elevation: results[index].elevation},
      {where: {round_lat: roundCoords(results[index].location.lat), round_lon:roundCoords(results[index].location.lng)}})
      .then(function (nodes){
        if (nodes[0] < 1) notFound.push([roundCoords(results[index].location.lat), roundCoords(results[index].location.lng)]);
        if (index === results.length-1){
          console.log(notFound);
        }
      })
    })(i)
  }
}


// RoundNode.findAll({
//   where: {round_lat: roundCoords(results[index].location.lat), round_lon:roundCoords(results[index].location.lng)}
//   })
// .then(function (nodes){
//   if (nodes && nodes.length===0){
//     notFound.push([roundCoords(results[index].location.lat), roundCoords(results[index].location.lng)])
//     console.log("not found");
//   }
//   if (nodes.length > 0){
//     console.log("found", nodes.length);
//   }
// })



var RoundNode = db.sequelize.define('RoundNode', db.model.config, db.model.options);
RoundNode.sync().then(function (){
  console.log("sequelize db syncd");
  // gmaps_data(5,addElevation);
});

// console.log(models);

function roundCoords (num) {
  return Math.round(num * 100000) / 100000
}
