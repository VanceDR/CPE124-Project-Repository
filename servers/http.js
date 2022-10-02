// Final version
var express = require('express'),
  sensorRoutes = require('../routes/sensors'),
  webapp = require('../routes/webapp')

var app = express();


app.use('/pi/sensors', sensorRoutes);
app.use('/', webapp)
// app.use('/things', thingsRoutes);

app.get('/pi', function (req, res) {
  res.send('This is the WoT-Pi!')
});

module.exports = app;