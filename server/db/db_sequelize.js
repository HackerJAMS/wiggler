// ORM implementation that is used when populating the database 
// with elevation data at each node in the graph
// the only file that uses this is "./db/createElevationDb"

var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URL_STR,{
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

var Elevation = {config:{
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement:true
  },
  round_lat: Sequelize.FLOAT,
  round_lon: Sequelize.FLOAT,
  lat: Sequelize.FLOAT,
  lon: Sequelize.FLOAT,
  elevation: Sequelize.FLOAT
}, options: {
  timestamps:false,
  tableName: 'elevation_test'
}}
//model: Node, 
module.exports = {elevation: Elevation, sequelize: sequelize};
