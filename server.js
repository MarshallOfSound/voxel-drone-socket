const express = require('express');
const app = express();

const findRemote = require('./lib/findRemote');

app.get('/find_ip.js', (req, res) => {
  findRemote()
    .then((FOUND_IP) => {
      res.send(`window.IP = "${FOUND_IP}";`);
    });
});

app.use('/', express.static('base'));

app.listen(3000, () => {
  console.log('Voxel Drone - Running on port 3000');
  console.log('http://localhost:3000');
});
