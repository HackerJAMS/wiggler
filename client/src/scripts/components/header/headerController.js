;
(function (){
  'use strict';
  angular.module('app.header', [])
  .controller('HeaderController', ['$mdSidenav', function($mdSidenav){
    var vm = this;

    vm.openSidebar = function (){
      $mdSidenav('left').open();
    }
    vm.closeSideNavPanel = function (){
      $mdSidenav('left').close();
    }
  
  }])
})();
