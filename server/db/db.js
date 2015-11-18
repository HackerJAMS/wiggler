/***

  Database Configuration File

***/
var pg = require('pg');

// Connect to AWS database
// postgres://username:password@host/database
var conString = process.env.DB_URL_STR;
module.exports = new pg.Client(conString);
