var fs = require('fs');
var _ = require('underscore');

var R = 6373; // Radius of the earth in km

var time = function (point1, point2) {
  return (point2[2] - point1[2])*24;
};

var deg2rad = function (deg) {
  return deg * (Math.PI/180)
};

var distance = function (point1, point2) {
  var lat1 = point1[0];
  var lon1 = point1[1];
  var lat2 = point2[0];
  var lon2 = point2[1];

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

var totalDistance = function (points) {
  var totalDistance = 0;
  for (var i = 0; i < points.length - 1; i++) {
    var current = points[i];
    totalDistance += distance(points[i], points[i+1]);
  }
  return totalDistance;
};

var totalTime = function (points) {
  var totalTime = 0;
  for (var i = 0; i < points.length - 1; i++) {
    var current = points[i];
    totalTime += time(points[i], points[i+1]);
  }
  return totalTime;
};

var throttle = function (points, speed) {
  points = points.slice();

  return points;
};

var info = function (points) {
  var distance = totalDistance(points);
  var time = totalTime(points);
  var speed = distance/time;

  console.log('Total distance: ' + distance + ' km');
  console.log('Total time: ' + time*60 + ' min');
  console.log('Average speed: ' + speed + ' km/h')
};

var decorateSpeed = function (points) {
  for (var i = 0; i < points.length - 1; i++) {
    points[i+1][3] = distance(points[i], points[i+1]) / time(points[i], points[i+1]);
  }
};

var decorateTimeDiff = function (points) {
  for (var i = 0; i < points.length - 1; i++) {
    points[i+1][3] = points[i+1] - points[i+1];
  }
};

var file = fs.readFileSync('data.txt', 'utf8');
var data = _.map(file.split('\n'), function (line) {
  return line.split(' ');
});
var points = data.slice(0, data.length-1);

decorateSpeed(points);
console.log(points);

console.log('\nStandard: ');
info(points);

console.log('\nThrottle 35: ');
info(throttle(points, 35));

console.log('\nThrottle 30: ');
info(throttle(points, 30));
