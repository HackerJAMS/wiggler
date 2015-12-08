var Q = require('q');
var closestNode = require('../utility/closestNode.js');
var db = require('../db/db.js');


module.exports = function(req, res) {
  var start = [-122.4428,37.7894] || req.body.start;
  var distance = 3 || req.body.distance;
  if (start) {
    findOutNodes(start, distance)
      .then(function (outNodes) {
        getStartNode(start)
          .then(function (param) {
            console.log("in pathfinding", param, outNodes.out_nodes.length);
            var defer = Q.defer();
            var done = 0;
            var count = outNodes.out_nodes.length;
            var out_paths = {};

            for (var i = 0; i < count; i++) {
              (function(i){
                console.log("finding path between:", param.startNode, outNodes.out_nodes[i]);
                var query = "select seq, id1 as node,id2 as edge, cost from pgr_dijkstra('SELECT gid AS id, source::integer, target::integer, bike_cost::double precision AS cost, r_bike_cost::double precision as reverse_cost FROM ways'," + param.startNode + "," + outNodes.out_nodes[i] + ", true, true);"
                db.query(query, function (err, result) {
                  done++;
                  out_paths[outNodes.out_nodes[i]] = result.rows;
                  if (done === count) {
                    defer.resolve(out_paths);
                  }
                })
              })(i)
            }
            return defer.promise;
          })
          .then(function (out_paths_result) {
            var minCostNode = sumCosts(out_paths_result);
            var bestPath = out_paths_result[minCostNode];
            var visitedNodes = bestPath.map(function (step){
              return step.node;
            })
            
          })
      })
  }
}

var sumCosts = function(paths){
  var minCost = {id:0, cost:Infinity};
  for (var key in paths) {
    var sumCost = 0;
    for (var i = 0; i< paths[key].length; i++){
      sumCost += paths[key][i].cost;
    }
    if (sumCost>0 && minCost.cost > sumCost){
      minCost= {id:key, cost: sumCost};
    }
  }
  return minCost.id;
}

var getStartNode = function(startCoord, endCoord) {
  var defer = Q.defer();
  var startNode;
  closestNode(startCoord, function(closestStartNode) {
    // the id of the closest node to the start point of the request is closestNode[id]
    // distance from the route request point in meters is closestNode[distance]
    startNode = closestStartNode.id;
    defer.resolve({
      startNode: startNode
    });
  })
  return defer.promise;  
};

var findOutNodes = function(start, distance) {
  var defer = Q.defer();
  var distance_in_meters = distance * 1609;
  var queryStr = "SELECT distinct id FROM (SELECT id, class_id, st_distance(a.the_geom, poi) AS distance FROM ways_vertices_pgr a, (SELECT st_makepoint(" + start[0] + "," + start[1] + ")::geography AS poi) AS poi, ways AS b WHERE (id=b.source or id=b.target) AND class_id NOT IN (101,102,103,104,105,122)) AS d_table WHERE distance BETWEEN " + Math.round(distance_in_meters / 3) + " AND " + Math.round(distance_in_meters / 2) + "ORDER BY id LIMIT 20";
  db.query(queryStr, function(err, out_result) {
    if (err) console.log(err);
    var ids=[]
    for (var i=0; i< out_result.rows.length; i++){
      ids.push(out_result.rows[i].id);
    }
    defer.resolve({out_nodes: ids});
  });
  return defer.promise;  
}
