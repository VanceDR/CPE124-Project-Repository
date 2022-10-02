// Importing
var express = require('express'),
  sensorRoutes = require('./routes/sensors'),
  resources = require('./resources/model'),
  webapp = require('./routes/webapp'),
  luxon = require('luxon')


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
io.on('connection', (socket) => {
    console.log(`A connection is running @ ${socket.id}`)
    var startTime = DateTime.now() // Start Time after Initializing
    socket.on("entering", (data)=>{
        // ---- For Time Last Updated when someone Entered ----
        var endTime = DateTime.now()
        var changeTime = endTime.diff(startTime).toMillis()
        var relativeTime = DateTime.now().minus(changeTime).toRelative()
        startTime = DateTime.now()
        // -- end --

        io.emit('message', data, relativeTime) // Emiting using Socket.IO to send data to HTML
    })
    socket.on("exiting", (data)=>{
        // ---- For Time Last Updated when someone Exited ----
        var endTime = DateTime.now()
        var changeTime = endTime.diff(startTime).toMillis()
        var relativeTime = DateTime.now().minus(changeTime).toRelative()
        startTime = DateTime.now()
        // -- end --

        io.emit('message', data, relativeTime) // Emiting using Socket.IO to send data to HTML
    })
})
