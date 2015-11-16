require('angular');
require('')
var app = angular.module('app', ['ngRoute',
  'app.home'
]);

app.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/', {
    templateUrl: 'src/scripts/components/home/home.html',
    controller: "HomeController"
  })
}])
