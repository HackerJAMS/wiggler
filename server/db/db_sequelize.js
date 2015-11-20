var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URL_STR,{
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

var Node = {config: {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: "id"
  },
  round_lon: {
    type: Sequelize.FLOAT(11,8),
    field: "round_lon"
  },
  round_lat: {
    type: Sequelize.FLOAT(11,8),
    field: "round_lat"
  },
  elevation: {
    type: Sequelize.FLOAT(11,8),
    field: "elevation"
  }
}, options: 
{
  tableName: 'round_nodes',
  timestamps: false
}};

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

module.exports = {model: Node, elevation: Elevation, sequelize: sequelize};
