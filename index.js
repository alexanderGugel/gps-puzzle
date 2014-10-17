var fs = require('fs');
var _ = require('underscore');

var deg2rad = function (deg) {
  return deg * (Math.PI/180);
};

var distance = function (point1, point2) {
  return Math.acos(
    Math.sin(deg2rad(point1.latitude)) * Math.sin(deg2rad(point2.latitude)) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * Math.cos(deg2rad(point2.longitude - point1.longitude))
  )*6370;
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
