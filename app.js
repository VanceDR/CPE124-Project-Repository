// Importing
var express = require('express'),
  sensorRoutes = require('./routes/sensors'),
  resources = require('./resources/model'),
  webapp = require('./routes/webapp'),
  luxon = require('luxon')

const {readFileSync , writeFileSync } = require('fs')

var app = express();
const DateTime = luxon.DateTime


app.use('/pi/sensors', sensorRoutes);
app.use('/', webapp)

app.get('/pi', function (req, res) {
  res.send('This is the WoT-Pi!')
});

// --- CODES from the BOOK for the PIR Sensor ---
// var pirPlugin = require('./plugins/internal/pirPlugin') //#A
// pirPlugin.start({'simulate': true, 'frequency': 5000}); //#B

const socket = require('socket.io');

// Initializing Server
const server = app.listen(resources.pi.port, function () {
    console.log('HTTP server started...');
    console.info('Your WoT Pi is up and running on port http://localhost:%s', resources.pi.port);
    
});

// WebSocket using Socket.IO
console.log('WebSocket is Running')

const io = socket(server)
var peopleCount = 0
io.on('connection', (socket) => {
    console.log(`A connection is running @ ${socket.id}`)
    
    var startTime = DateTime.now() // Start Time after Initializing
    socket.on("entering", ()=>{
      // ---- For Time Last Updated when someone Entered ----
      var endTime = DateTime.now()
      var changeTime = endTime.diff(startTime).toMillis()
      var relativeTime = DateTime.now().minus(changeTime).toRelative()
      startTime = DateTime.now()
      peopleCount++
      // -- end --
      io.emit('message', peopleCount, relativeTime) // Emiting using Socket.IO to send data to HTML
    })
    socket.on("exiting", ()=>{
      // ---- For Time Last Updated when someone Entered ----
      var endTime = DateTime.now()
      var changeTime = endTime.diff(startTime).toMillis()
      var relativeTime = DateTime.now().minus(changeTime).toRelative()
      startTime = DateTime.now()
      if (peopleCount > 0) {
        peopleCount--
      }
      // -- end --
      io.emit('message', peopleCount, relativeTime) // Emiting using Socket.IO to send data to HTML
    })
    socket.on("currentData", (data, time) =>{
        writeFileSync('./data.json',`{"count":"${data}","time":"${time}", "currentTime":"${DateTime.now().toISO()}"}`)
    })
    socket.on("retrieveData", ()=>{
      var file = readFileSync('./data.json')
      var lastData = JSON.parse(file)
      peopleCount = Number(lastData.count)
      io.emit('message', Number(lastData.count),String(lastData.time))
    })
    socket.on("send-hourly", (data)=>{
      console.log('emitted hourly')
      socket.broadcast.emit('hourly-message', data, DateTime.now().toISOTime())
    })

    socket.on('send-change', (data,time)=>{
      console.log('emitting change')
      socket.broadcast.emit('change-message', data, DateTime.now().toISOTime())
    })
    var hourlyInterval = () =>{setInterval(()=>{
      socket.broadcast.emit('hourly')
    }, 10000)}
    const connectedCount = io.of("/").sockets.size
    console.log(connectedCount)
    if (connectedCount == 1){
      hourlyInterval()
    }
})

/* SAMPLE CODE FOR INTERFACING WITH PIR SENSOR FROM THE BOOK
var gpio = require("pi-gpio");

pin = 11;

function readProximity() {
  gpio.open(pin, "input", function (err) { //#A
    gpio.read(pin, function (err, value) { //#B
      if (err) exit(err);
      console.log(value ? 'there is some one!' : 'not anymore!'); //#C
      readProximity();
    });
  });
}

function exit(err) {
  gpio.close(pin);
  if (err) console.log('An error occurred: ' + err);
  console.log('Bye, bye!')
  process.exit();
}
process.on('SIGINT', exit);

readProximity();

// #A Open the GPIO pin in input mode
// #B Read the digital value (1 or 0) on the pin
// #C If the PIR sensor sees a warm body the value will be 1 otherwise it will be 0
*/