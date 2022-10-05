// Importing
var express = require("express"),
  sensorRoutes = require("./routes/sensors"),
  resources = require("./resources/model"),
  webapp = require("./routes/webapp"),
  luxon = require("luxon"),
  socket = require("socket.io"),
  Gpio = require('onoff').Gpio;

const { clear } = require("console");
const { readFileSync, writeFileSync, existsSync, fstat } = require("fs"); // For File Writing and Reading
const { exit } = require("process");

// Initialize Express
var app = express();
// Initialize Luxon for time
const DateTime = luxon.DateTime;

// Use the created routes
app.use("/pi/sensors", sensorRoutes);
app.use("/", webapp);

// Route to /pi
app.get("/pi", function (req, res) {
  res.send("This is the WoT-Pi!");
});

// Sensors
// entrySensor = new Gpio(17, 'in', 'both') // For Entry (GPIO17 or pin 11)
// exitSensor = new Gpio(27, 'in', 'both') // For Exit (GPIO27 or pin 13)

/* PINOUT FOR RASPBERRY PI
    3V3  (1) (2)  5V
  GPIO2  (3) (4)  5V
  GPIO3  (5) (6)  GND
  GPIO4  (7) (8)  GPIO14
    GND  (9) (10) GPIO15
  GPIO17 (11) (12) GPIO18
  GPIO27 (13) (14) GND
  GPIO22 (15) (16) GPIO23
     3V3 (17) (18) GPIO24
  GPIO10 (19) (20) GND
   GPIO9 (21) (22) GPIO25
  GPIO11 (23) (24) GPIO8
     GND (25) (26) GPIO7
   GPIO0 (27) (28) GPIO1
   GPIO5 (29) (30) GND
   GPIO6 (31) (32) GPIO12
  GPIO13 (33) (34) GND
  GPIO19 (35) (36) GPIO16
  GPIO26 (37) (38) GPIO20
     GND (39) (40) GPIO21
*/

// exit = (err) =>{
//   if (err) console.log("An error occurred: " + err);
//   sensor.unexport();
//   console.log("Bye, bye!");
//   process.exit();
// }
// process.on("SIGINT", exit);

// Initializing Server
const server = app.listen(resources.pi.port, function () {
  console.log("HTTP server started...");
  console.info(
    "Your WoT Pi is up and running on port http://localhost:%s",
    resources.pi.port
  );
});

// WebSocket using Socket.IO
console.log("WebSocket is Running");

// Initializing Socket.IO
const io = socket(server); // Initialize socket at the server
var peopleCount = 0; // Counter Variable
var connectedCount = 0;

  // HOURLY INTERVAL, currently set to 10 Seconds i.e. 10000ms

function hourlyInterval(callback) {
  setInterval(callback, 5000)
}

io.on("connection", (socket) => { // Listens for connection to the server
  console.log(`A connection is running @ ${socket.id}`); // Displays connection ID
  var startTime = DateTime.now(); // Start Time after Initializing

  // STARTING THE SENSORS
  // entrySensor.watch((err,value) => {
  //   if (err) exit(err); // If error, display error
  //   if (value == 1){ 
  //     socket.emit('entering') // If actiavted, emit a entering event
  //   } else {
  //     console.log('Person Entered') // if person passed, display that a person entered
  //   }
  // })

  // entrySensor.watch((err,value) => {
  //   if (err) exit(err); // If error, display error
  //   if (value == 1){
  //     socket.emit('exiting')  // If actiavted, emit a entering event
  //   } else {
  //     console.log('Person Exited') // if person passed, display that a person entered
  //   }
  // })

  // WHEN SOMEONE ENTERS
  socket.on("entering", () => {
    // ---- For Time Last Updated when someone Entered ----
    var endTime = DateTime.now(); // Takes current time
    var changeTime = endTime.diff(startTime).toMillis(); // Subtracts current time to previous time
    var relativeTime = DateTime.now().minus(changeTime).toRelative(); // Gets the relative time to previous time, i.e. 4 seconds ago
    startTime = DateTime.now(); // Resets the current time
    peopleCount++; // Increment Counter
    // -- end --
    io.emit("message", peopleCount, relativeTime); // Emiting using Socket.IO to send data to HTML
  });

  // WHEN SOMEONE EXITS
  socket.on("exiting", () => {
    // ---- For Time Last Updated when someone Entered ----
    var endTime = DateTime.now(); // Takes current time
    var changeTime = endTime.diff(startTime).toMillis(); // Subtracts current time to previous time
    var relativeTime = DateTime.now().minus(changeTime).toRelative(); // Gets the relative time to previous time, i.e. 4 seconds ago
    startTime = DateTime.now(); // Resets the current time
    if (peopleCount > 0) { // If count is zero, remain at zero
      peopleCount--; // Decrements the counter
    }
    // -- end --
    io.emit("message", peopleCount, relativeTime); // Emiting using Socket.IO to send data to HTML
  });

  // SAVES CURRENT SINGLE DATA
  socket.on("currentData", (data, time) => {
    writeFileSync( // Writes file
      "./data.json", // Path
      `{"count":"${data}","time":"${time}", "currentTime":"${DateTime.now().toISO()}"}` // Json format data
    );
  });

  // RETRIEVES SAVED SINGLE DATA
  socket.on("retrieveData", () => {
    if (existsSync("./data.json")){
      var file = readFileSync("./data.json"); // Reads file @ path
      var lastData = JSON.parse(file); // Parses the JSON data
      peopleCount = Number(lastData.count); // sets the counter with the saved data
      io.emit("message", Number(lastData.count), String(lastData.time)); // returns the data to HTML via io.emit
    }
  });

  // SENDS DATA TO GRAPH HOURLY
  socket.on("send-hourly", (data) => {
    console.log("emitted hourly"); // Log for emitting hourly
    socket.broadcast.emit("hourly-message", data, DateTime.now().toISOTime()); // sends data to HTML via socket.broadcast.emit
  });

  // SENDS CHANGES TO COUNT TO GRAPHS
  socket.on("send-change", (data, time) => {
    console.log("emitting change"); // Log for emitting hourly
    socket.broadcast.emit("change-message", data, DateTime.now().toISOTime({includeOffset:false, suppressMilliseconds:true})); // sends data to HTML via socket.broadcast.emit
  });

  socket.on("arrayData", (data) =>{
    writeFileSync("./arrayData.json", JSON.stringify(data)) // Method for writing to JSON file the Chart Data
  })

  socket.on("getData", () => {
    if (existsSync("./arrayData.json")) {
      var file = readFileSync("./arrayData.json") // Method for reading the JSON file of the Chart Data
      io.emit('retrieveArrayData', JSON.parse(file)) // Sends back the data to HTML
    }
  })


  // Displays number of instances of socket
  connectedCount = io.of("/").sockets.size;
  console.log(connectedCount);
  // Run hourly interval when atleast one socket is connected

  if (connectedCount == 1) {
      hourlyInterval(()=>{
      socket.broadcast.emit('hourly')
    });
  }
});


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
