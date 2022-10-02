// Initial version
var express = require('express'),
  router = express.Router(), //#A
  resources = require('./../resources/model');

router.route('/').get(function (req, res, next) { //#B
  res.send(resources.pi.sensors);  //#C
});

router.route('/pir').get(function (req, res, next) { //#D
  res.send(resources.pi.sensors.pir);
});

module.exports = router; //#F

//#A We require and instantiate an Express Router to define the path to our resources
//#B Create a new route for a GET request on all sensors and attach a callback function
//#C Reply with the sensor model when this route is selected
//#D This route serves the passive infrared sensor
//#E These routes serve the temperature and humidity sensor
//#F We export router to make it accessible for "requirers" of this file
