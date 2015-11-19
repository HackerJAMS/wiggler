var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URL_STR);

var Node = sequelize.define('node', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    field: "id"
  },
  lon: {
    type: Sequelize.FLOAT(11,8),
    field: "lon"
  },
  lat: {
    type: Sequelize.FLOAT(11,8),
    field: "lat"
  },
  numofuse: {
    type: Sequelize.INTEGER,
    field: "numofuse"
  },
  elevation: {
    type: Sequelize.FLOAT(11,8),
    field: "elevation"
  }
}, 
{
  tableName: 'nodes',
  timestamps: false
});

Node.sync().then(function (){
  console.log("sequelize db syncd");
});

module.export = Node;
