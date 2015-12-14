// var request = require('supertest');
// var express = require('express');
// var expect = require('chai').expect;
// var app = require('../server/server.js');


// describe('Route Types', function() {
//   it('returns the shortest path between two points on request', function(done) {
//     request(app)
//       .post('/route')
//       .send({
//         start: [-122.428561, 37.767191],
//         end:  [-122.437364, 37.774222],
//         prefs: {
//           shortestPathChecked: true,
//           minElevPathChecked: false,
//           minBikingChecked: false,
//           minHikingChecked: false
//         }
//       })
//       .expect(200)
//       .expect(function (res){
//         console.log(res);
//         expect(true).to.be.true
//       })
//       .end(done);
//   })
// })

var expect = require('chai').expect;
// connect to postgresql server
var pg = require('pg');
var process = require('../server/utility/process_result.js');
var elev = require('../server/utility/get_elevation_data.js');

var minElevationPath = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, eleCost::double precision AS cost FROM ways'," + start + "," + end + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways for the flattest route...", err);
    }
    var coordinates = process(result);
    var path_data;
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};   

var shortestPath = function(start, end, callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, length::double precision AS cost FROM ways'," + start + "," + end + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways for the shortest path...", err);
    }
    var coordinates = process(result);
    var path_data;
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};

var minHikeBike = function(start, end, hikeOrBike,callback) {
  var queryString = "SELECT seq, id1 AS node, id2 AS edge, b.source, b.target, cost, ST_AsText(ST_Transform(b.the_geom,4326)) FROM pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, "+hikeOrBike+"_cost::double precision AS cost, r_"+hikeOrBike+"_cost::double precision AS reverse_cost FROM ways WHERE length !=0'," + start + "," + end + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;";

  db.query(queryString, function(err, result) {
    if(err) {
      console.log("err when query table ways...", err);
    }
    var coordinates = process(result);
    var path_data;
    elev(coordinates, function(elevation){
      path_data = [coordinates, elevation.results];
      callback(err, path_data);
    });
  });
};

var start = 23055;
var end = 6346;
var conString = 'postgres://postgres:@ec2-52-34-24-220.us-west-2.compute.amazonaws.com:5432/sf_routing';
var db;

describe('Path query should return results', function(){
  // Connect to AWS database
  // postgres://username:password@host/database

  beforeEach(function(done) {
    db = new pg.Client(conString);
    db.connect(function(err) {
      if (err) {
        return console.error('could not connect to postgres: ', err);
      } else {
        done();
      }
    });
  })

  afterEach(function() {
    db.end();
  })

  it('shortest_path should return both coordinates and elevations', function(done){    
    shortestPath(start, end, function(err, result) {
      if (err) {
        console.error('could not obtain the path: ', err);
      } else {
        expect(result[0].length).to.not.equal(0);
        expect(result[1].length).to.not.equal(0);        
        done();
      }
    }); 
  })

  it('minimum_elevation_path should return both coordinates and elevations', function(done){    
    minElevationPath(start, end, function(err, result) {
      if (err) {
        console.error('could not obtain the path: ', err);
      } else {
        expect(result[0].length).to.not.equal(0);
        expect(result[1].length).to.not.equal(0);        
        done();
      }
    }); 
  })

  it('minimum_hike_bike_path should return both coordinates and elevations', function(done){    
    minHikeBike(start, end, "hike", function(err, result) {
      if (err) {
        console.error('could not obtain the path: ', err);
      } else {
        expect(result[0].length).to.not.equal(0);
        expect(result[1].length).to.not.equal(0);        
        done();
      }
    }); 
  })

  it('minimum_hike_bike_path should return both coordinates and elevations', function(done){    
    minHikeBike(start, end, "bike", function(err, result) {
      if (err) {
        console.error('could not obtain the path: ', err);
      } else {
        expect(result[0].length).to.not.equal(0);
        expect(result[1].length).to.not.equal(0);        
        done();
      }
    }); 
  })

})
