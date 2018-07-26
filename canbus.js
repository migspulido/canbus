/*
This simple javascript program takes data from an OBD2 scanner
and prints it to a CLI screen. 
The program also uses servi.js and P5.js server to allow a user to access data outside of the execution environment. 

Miguel Pulido
Systems Architect
*/


var OBDReader = require('serial-obd'); // include serial OBD library
//var option = {};
//options.baudrate = 38400;
var serialOBDReader = new OBDReader("COM6", {baudrate: 38400});
var dataReceivedMarker = {}; 
// used to capture ODB2 data to be passed to server
var latestData = 0; 
// to use File System
var fs = require('fs');



//var OBDdata = 0; // save latest obd data
var servi = require('servi');	// include servi library
var app = new servi(false);	// servi instance
app.port(8080);			// port number to run server on

// configure the server's behavior

app.serveFiles("public");	//serve all static html files from /public
app.route('/data', sendData);	// route request for /data to sendData() function

//start server now that everything is configured
app.start();



serialOBDReader.on('dataReceived', function (data){
console.log(data);
dataReceivedMarker = data;
latestData = data;


fs.appendFile('CANData.txt', JSON.stringify(dataReceivedMarker), function (err){
if (err) throw err;
console.log('Data logged!');

});


});

serialOBDReader.on('connected', function (data) {
this.addPoller("vss");
this.addPoller("rpm");
this.addPoller("temp");
this.addPoller("load_pct");	// in works
this.addPoller("map");	// in works
this.addPoller("frp");	// in works

this.startPolling(2000); // Polls all added pollers each 2000ms


});



// Server function
function sendData(request) {
// print out the fact that a client HTTP request came in to the server
console.log("Got a client request, sending them the data.");
// respond to the client request with the latest CANBUS string
request.respond(latestData);

}



serialOBDReader.connect();

