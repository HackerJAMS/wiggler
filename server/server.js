var express = require('express')
var app = express()
 

app.use(express.static(__dirname + '/../client/app'));
 
app.listen(3000)