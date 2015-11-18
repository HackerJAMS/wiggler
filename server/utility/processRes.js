/***

  Utility Function File:
  Preprocess result and return the format which front-end could use
  @param: result - result returned from database query
  @return: coordinates - nested array of latitude and longitude of points in all line segments
           [[[x1, y1], [x2, y2]], [[x4, y4], [x3, y3], [x2, y2]]]

***/
module.exports = function(result) {    
  var coordinates = [];

  for (var i = 0; i < result.rows.length - 1; i++) {
    var string = result.rows[i].st_astext;
    var stringArr = string.slice(11, string.length - 1).split(',');

    var segmentTuple = [];

    if (result.rows[i].node === result.rows[i].target) { // reverse the order of points in the segment
      for (var j = stringArr.length - 1; j >= 0; j--) {
        var pointTuple = [];
        var temp = stringArr[j].split(' ');
        pointTuple.push(temp[1]);
        pointTuple.push(temp[0]);
        segmentTuple.push(pointTuple);
      }        
    } else {
      for (var j = 0; j < stringArr.length; j++) { // keep the order of points in the segment
        var pointTuple = [];
        var temp = stringArr[j].split(' ');
        pointTuple.push(temp[1]);
        pointTuple.push(temp[0]);
        segmentTuple.push(pointTuple);
      }
    }
    coordinates.push(segmentTuple);
    // for reverse points in segment
    //   if(result.rows[i].node === result.rows[i].target) {
    //   // reverse the segmentCoordArr
    //     var segmentCoordArrReverse = [];
    //     for (var j = segmentCoordArr.length - 1; j >= 0; j--) {
    //       segmentCoordArrReverse.push(segmentCoordArr[j]);
    //     }
    //     coordinates.push(segmentCoordArrReverse);
    //   } else {
    //     coordinates.push(segmentCoordArr);
    //   }
  }
  return coordinates;
}