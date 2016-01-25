var express = require('express');
var app = express();

app.use('/', express.static('base'));

app.listen(3000, function () {
  console.log('Voxel Drone - Running on port 3000');
  console.log('http://localhost:3000');
});
