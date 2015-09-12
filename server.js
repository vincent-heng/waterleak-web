/*Load Dependencies*/
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var url = require('url');
var querystring = require('querystring');
var path = require('path');
var request = require('request');

var ent = require('ent'); // htmlentities' equivalent
var colors = require('colors');
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

var modulePlayer = require('./scripts/Player');

	/*Link Files*/
// Load the main page
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

// Load socket.io
app.get('/socket.io/socket.io.js', function (req, res) {
  res.sendfile(__dirname + '/socket.io/socket.io.js');
});

// Load css
app.get('/css/modern-business.css', function (req, res) {
  res.sendfile(__dirname + '/css/modern-business.css');
});

app.get('/css/style.css', function (req, res) {
  res.sendfile(__dirname + '/css/style.css');
});


app.get('/scripts/app.js', function (req, res) {
  res.sendfile(__dirname + '/scripts/app.js');
});

/*Initialize datas*/
var okMessage = "Welcome fellow.";
var infos = {};

var getInfosFromDatabase = function() {
    request("http://iotroadshow.azure-mobile.net/api/getlatest", function(error, response, body) {
        if (!error && response.statusCode == 200) {
            infos = body;
            sendInfos(body);
            console.log("[GET] getlatest success".input);
        } else {
            console.log("[GET] getlatest failed".error);
        }
    });
};

var globalTimer = setInterval(getInfosFromDatabase,10000);

var sendInfos = function(infos) {
    io.sockets.emit('refresh_info_event', infos);
};

/*On User Connection*/
io.sockets.on('connection', function (socket) {
    console.log("New user connected !".data);
    socket.emit(infos);

    socket.on('toggle_valve_event', function() {
        request("http://iotroadshow.azure-mobile.net/api/togglewaterstate", function(error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("[GET] toggleValve success".input);
            } else {
                console.log("[GET] toggleValve failed".error);
            }
        });
    });
});

console.log("Starting the server...".info);
server.listen(8080);
getInfosFromDatabase();
