
require('angular')
var MainController = require('./controllers/mainController.js');
var app = angular.module('app', [])

// app.controller('MainController', function($scope) {
//     $scope.message = 'Angular Works!'
// });

app.controller('MainController', ['$scope', MainController]);