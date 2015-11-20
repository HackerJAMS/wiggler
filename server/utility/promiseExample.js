var Q = require('q');

var delayOne = function(val1){
  var d =Q.defer();
  setTimeout(function(){
    console.log(val1);
    d.resolve(val1);
  }, 300);
  return d.promise;
};

var delayTwo = function(val1){
  var d =Q.defer();
  setTimeout(function(){
    console.log(' my name is');
    d.resolve(val1 + ' my name is');
  }, 200);
  return d.promise;
};

var delayThree = function(val2){
  // var d =Q.defer();
  setTimeout(function(){
    console.log('Jia');
    // d.resolve(val2 + 'Jia');
  }, 100);
  // return d.promise; 
};

delayOne('hi')
.then(delayTwo)
.then(delayThree)
.done();