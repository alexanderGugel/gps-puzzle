var fs = require('fs');
var _ = require('underscore');

var deg2rad = function (deg) {
  return deg * (Math.PI/180);
};

var distance = function (point1, point2) {
  var lat1 = point1.latitude;
  var lon1 = point1.longitude;
  var lat2 = point2.latitude;
  var lon2 = point2.longitude;

  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var distance = R * c; // Distance in km

  // console.log('Distance ' + lat1 + '|' + lon1 + ' -> ' + lat2 + '|' + lon2 + ': ' + distance);
  return distance;
};

var file = fs.readFileSync('data.txt', 'utf8');

var data = _.map(file.split('\n'), function (line) {
  return line.split(' ');
});

var points = data.slice(0, data.length-1); // remove empty line

points = _.map(points, function (point, index) {
  return {
    latitude: point[0],
    longitude: point[1],
    timestamp: point[2]
  };
});

_.each(points, function (point, index) {
  point.diffDistance = distance(points[index-1] || point, point);
  point.diffTime = (point.timestamp - (points[index-1] || point).timestamp) * 24;
});

// In km
var totalDistance = function (points) {
  return _.reduce(points, function (totalDistance, point) {
    return totalDistance += point.diffDistance;
  }, 0);
};

// In h
var totalTime = function (points) {
  return _.reduce(points, function (totalTime, point) {
    return totalTime += point.diffTime;
  }, 0);
};

// In km/h
var averageSpeed = function (points) {
  return (totalDistance(points) / totalTime(points));
};

// Output all the info
var info = function (points) {
  console.log('Average speed: ' + averageSpeed(points) + ' km/h');
  console.log('Total time: ' + totalTime(points)*60 + ' min');
  console.log('Total distance: ' + totalDistance(points) + ' km');
};

var throttle = function (points, maxSpeed) {
  // Clone array and objects within in
  points = points.slice();
  points = _.map(points, function (point) {
    return _.clone(point);
  });

  _.each(points, function (point, index) {
    if (point.diffTime !== 0) {
      var speed = (point.diffDistance / point.diffTime);
      if (speed > maxSpeed) {
        speed = maxSpeed;
        point.diffTime = point.diffDistance / maxSpeed;
      }
    }
  });

  return points;
};

console.log('\nNo throttling');
info(points);

console.log('\nMax speed 30 km/h');
info(throttle(points, 30));

console.log('\nMax speed 35 km/h');
info(throttle(points, 35));
