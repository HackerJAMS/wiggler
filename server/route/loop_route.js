// Path-finding with the same start and ending points
// We use a combination of the cost models we developed for this application of Dijkstra's algorithm
// There are many ansyncronous requests in this model, so we use a chain of promises to execute it.
// Model progression:
// - Find all the nodes (referred to as "out nodes") within 1/3 to 1/2 of the requested total route distance
// - Find closest node to the requested start location
// - Run the k-paths version of Dijkstras to determine which out node has the lowest total cost from the start node-- this becomes the out-path for the loop
// - Get the geometry for the best out path
// - Find a **new** path from the end node of the out path -- force Dijkstra's to take a new path by multiplying the cost by the inverse distance from the original route


var Q = require('q');
var process = require('../utility/process_result.js');
var closestNode = require('../utility/closest_node.js');
var db = require('../db/db.js');
var elev = require('../utility/get_elevation_data');

module.exports = function(req, res) {
  var start = req.body.start.center; 
  var distance = req.body.distance;
  if (start && distance) {
    findOutNodes(start, distance)
      .then(function(outNodes) {
        getStartNode(start)
          .then(function(param) {
            getBestOutNode(param, outNodes)
              .then(getBestOutPath)
              .then(outPathGeom)
              .then(backPath)
              .then(function(loop) {
                var coordinates = process(loop);
                elev(coordinates, function(elevation) {
                  path_data = [coordinates, elevation.results];
                  res.send({
                    loop_path: path_data
                  });
                });
              })
          })

      })
  }
}

var backPath = function(out_path) {
  var defer = Q.defer();
  // console.log("out path info passed to back path", out_path.path_info);
  // var query = "select seq, id1 as node,id2 as edge, cost, b.source, b.target, st_astext(b.the_geom) from pgr_dijkstra('SELECT gid AS id, a.source, target, eleCost * (1/(dist.distance+.000001)) AS cost, dist.* FROM ways AS a, (select source, ST_Distance(the_geom, ST_GeomFromText(''" + out_path.geom + "'', 4326)) as distance from ways) AS dist WHERE dist.source = a.source'," + out_path.path_info.path_info.target + "," + out_path.path_info.path_info.source + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;"

  var query = "select seq, id1 as node,id2 as edge, cost, b.source, b.target, st_astext(b.the_geom) from pgr_dijkstra('SELECT gid AS id, a.source, target, bike_cost * (1/(dist.distance+.005)) AS cost, r_bike_cost * (1/(dist.distance+.005)) as reverse_cost,dist.* FROM ways AS a, (select source, ST_Distance(the_geom, ST_GeomFromText(''" + out_path.geom + "'', 4326)) as distance from ways) AS dist WHERE dist.source = a.source'," + out_path.path_info.path_info.target + "," + out_path.path_info.path_info.source + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;"
  db.query(query, function(err, result) {
    if (err) {
      console.log("error getting back path", err);
    }

    var full_path_result = out_path.path_info.out_path;
    result.rows.forEach(function(step) {
      full_path_result.push(step);
    })

    defer.resolve({
      rows: full_path_result
    });
  })
  return defer.promise;
}

var outPathGeom = function(out_path_deets) {
  var defer = Q.defer();

  var visitedEdges = out_path_deets.out_path.map(function(step) {
    return step.edge;
  });
  var query = "select st_astext(st_union(the_geom)) as out_path from (select * from ways where gid in (" + visitedEdges.join(",") + ")) as ways";

  db.query(query, function(err, result) {
    if (err) console.log("error getting out path geometry", err);
    defer.resolve({
      geom: result.rows[0].out_path,
      path_info: out_path_deets
    })
  })
  return defer.promise;
};

var getBestOutPath = function(path_info) {
  console.log("in best out path")
  var defer = Q.defer();
  var query = "select seq, id1 as node,id2 as edge, cost, b.source, b.target, st_astext(b.the_geom) from pgr_dijkstra('SELECT gid AS id, source, target, eleCost AS cost FROM ways'," + path_info.startNode + "," + path_info.path.target + ", false, false) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;"
  // var query = "select seq, id1 as node,id2 as edge, cost, b.source, b.target, st_astext(b.the_geom) from pgr_dijkstra('SELECT gid AS id, source, target, bike_cost AS cost, r_bike_cost as reverse_cost FROM ways'," + path_info.startNode + "," + path_info.path.target + ", true, true) a LEFT JOIN ways b ON (a.id2 = b.gid) ORDER BY seq;"
  db.query(query, function(err, out_path) {
    if (err) {
      console.log("there was an error getting the best outward path for the loop");
    } else {
      defer.resolve({
        path_info: path_info.path,
        out_path: out_path.rows
      });
    }
  })
  return defer.promise;
}

var getBestOutNode = function(param, outNodes) {
  console.log("in best out node")
  var defer = Q.defer();
  var out_paths = {};
  var query = "select seq, id1 as source,id2 as target, cost from pgr_kdijkstraCost('SELECT gid AS id, source::integer, target::integer, eleCost::double precision AS cost FROM ways'," + param.startNode + ", array[" + outNodes.out_nodes.join(",") + "], false, false);"
  // var query = "select seq, id1 as source,id2 as target, cost from pgr_kdijkstraCost('SELECT gid AS id, source::integer, target::integer, bike_cost::double precision AS cost, r_bike_cost::double precision as reverse_cost FROM ways'," + param.startNode + ", array[" + outNodes.out_nodes.join(",") + "], true, true);"
  db.query(query, function(err, result) {
    var minCost = Infinity;
    var bestPath;
    for (var i = 0; i < result.rows.length; i++) {

      if (result.rows[i].cost > 0 && result.rows[i].cost < minCost) {
        minCost = result.rows[i].cost
        bestPath = result.rows[i];
      }
    }
    defer.resolve({
      startNode: param.startNode,
      path: bestPath
    });

  })
  return defer.promise;
}

var sumCosts = function(paths) {
  var minCost = {
    id: 0,
    cost: Infinity
  };
  for (var key in paths) {
    var sumCost = 0;
    for (var i = 0; i < paths[key].length; i++) {
      sumCost += paths[key][i].cost;
    }
    if (sumCost > 0 && minCost.cost > sumCost) {
      minCost = {
        id: key,
        cost: sumCost
      };
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
  var queryStr = "SELECT distinct id FROM (SELECT id, class_id, st_distance(a.the_geom, poi) AS distance FROM ways_vertices_pgr a, (SELECT st_makepoint(" + start[0] + "," + start[1] + ")::geography AS poi) AS poi, ways AS b WHERE (id=b.source or id=b.target) AND class_id NOT IN (101,102,103,104,105,122)) AS d_table WHERE distance BETWEEN " + (distance_in_meters / 3) + " AND " + (distance_in_meters / 2) + "ORDER BY id";
  db.query(queryStr, function(err, out_result) {
    if (err) console.log(err);
    var ids = []
    for (var i = 0; i < out_result.rows.length; i++) {
      ids.push(out_result.rows[i].id);
    }
    defer.resolve({
      out_nodes: ids
    });
  });
  return defer.promise;
}
