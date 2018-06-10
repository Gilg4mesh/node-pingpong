
// Setup basic express server
var express = require('express');
var expressSession = require('express-session');
var bodyParser = require('body-parser')

var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT ;
var socketio = require('socket.io');

// Routing
app.use(express.static(__dirname + '/public'));


app.get('/test', function (req, res) {
  console.log("testset");
});    

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function () {
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


var io = socketio.listen(server);
io.on('connection', function (socket) {

  // downlaodRoomData from mysql 
  socket.on('test', function (test_id) {
    console.log(test_id);
  });
  
  
  // Left
  socket.on('Move', function (Y1,Y2) {
    socket.broadcast.emit('Move',Y1,Y2);
    console.log('Move paddle1'+Y1+' daste1'+Y2);
  });
  
  // Right
  socket.on('Start', function (Y) {
    socket.broadcast.emit('Start');
    console.log('start');
  });
  
});