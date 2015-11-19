var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URL_STR);

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


module.exports = {model: Node, sequelize: sequelize};
