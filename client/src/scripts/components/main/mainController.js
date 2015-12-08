;
(function (){
  'use strict';
  angular.module('app.main', [])
  .controller('MainController', ['$mdSidenav', function($mdSidenav){
    var vm = this;
    vm.closeLeftSideNavPanel = function(){
      $mdSidenav('left').close();
    }
    
  }])
})();