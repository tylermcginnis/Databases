var fs = require('fs');
var path = require('path');
var mysql = require('mysql');

var dbConnection = function(){
  return mysql.createConnection({
    user: "root",
    password: "",
    database: "chat"
  });
}


var messages = {};
messages.general = {};
var messageKey = 0;

var handleStaticRequests = function(request, response) {
  var filePath = './client' + request.url;
  if (filePath === '/client/') {
    filePath = './client/index.html';
  }

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
    contentType = 'text/javascript';
    break;
    case '.css':
    contentType = 'text/css';
    break;
  }

  fs.exists(filePath, function(exists) {
    if (exists) {
      fs.readFile(filePath, function(error, content) {
        if (error) {
          response.writeHead(500);
          response.end();
        }
        else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
        }
      });
    }
    else {
      response.writeHead(404);
      response.end();
    }
  });
};

var handlePostMessage = function(request, roomName, connect){
  connect.query("INSERT INTO messages SET ?", {username: "poop"}, function(err, res){});
  var messageData = '';

  request.on('data', function(data){
     messageData+=data;
  });


  request.on('end', function(){
    var parsedData = JSON.parse(messageData);
    var roomObj = messages[roomName] || {};
    var messageKey = Object.keys(roomObj).length;
    var messageObj = {};
    messageObj.username = parsedData.username;
    messageObj.text = parsedData.text;
    messageObj.roomname = roomName;
    messageObj.createdAt = new Date();
    roomObj[messageKey] = messageObj;
    messages[roomName] = roomObj;
    saveToFile();
  });
};

var handleGetMessages = function(request, response, roomName){
  request.on("error", function(){
    console.log("There was an error. Frick");
  });
  var messageObject = {};
  messageObject.results = messages[roomName] || {};
  response.write(JSON.stringify(messageObject));
};

var firstConnection = function(){
  var data = '';
  fs.readFile('./messageData.txt','utf8', function(err, data){
    if(!err){
    messages = JSON.parse(data);
  }
  });
};

var saveToFile = function() {
  fs.writeFile("./messageData.txt", JSON.stringify(messages), function(err){
    if(err){
      console.log('there was an error');
    } else{
      console.log('Successfully wrote to file');
    }
  });
};

var handleGetChatrooms = function(request, response){
  var keys = Object.keys(messages);
  response.write(JSON.stringify(keys));
};

exports.handlePostMessage = handlePostMessage;
exports.handleGetMessages = handleGetMessages;
exports.firstConnection = firstConnection;
exports.handleGetChatrooms = handleGetChatrooms;
exports.handleStaticRequests = handleStaticRequests;
exports.dbConnection = dbConnection;