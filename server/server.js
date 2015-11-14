var express = require('express')
var app = express()
var port = 3000;


app.use(express.static(__dirname + '/../client/app'));
 
app.listen(port);

console.log('Server now listening on port ' + port);
