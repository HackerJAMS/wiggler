//************* calls googleapi for refined elevation data *************

       // var newPoints = resampledPath.features.slice();
       // var newPointCoordinates = newPoints.map(function(n, i) {
       //        return n.geometry.coordinates;
       //     });

       // RouteService.postElevationRequest(newPointCoordinates)
       // .then(function successCb(res){
       //    var resampledPoints = RouteService.getElevationPath(res.data);
       //   //test for unique values; refactor for jasmine test

       //    var uniqueArr = resampledPoints.features;
       //    var nonUniqueArr = resampledPath.features;
       //    uniqueArr.forEach(function(feature){
       //      console.log(feature.properties.elevation);
       //  });

            
       //      L.geoJson(resampledPoints, {
       //      pointToLayer: function(feature, latlng) {
       //        var roundedElev = feature.properties.elevation.toFixed(2);
       //        var cssHeight = roundedElev;
       //        var myIcon = L.divIcon({
       //          className: 'elevations',
       //          html: '<div class="elevmarker"><div class="markercircle bottomcap marker-' + pathType + '"></div><div class="markerline marker-' + pathType + '" style="height:' + cssHeight + 'px">' + '</div><div class="markercircle marker-' + pathType + '"></div><div class="elevfigure">' + roundedElev + ' ft.</div></div>'
       //        });
       //        return L.marker(latlng, {
       //          icon: myIcon
       //        });
       //      }
       //    }).addTo(RouteService.map);
       // }, function errorCb(res){
       //    console.log('error in elevation request', res.status);
       // });
       
//**************************************