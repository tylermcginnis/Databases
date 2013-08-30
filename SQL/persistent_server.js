// var mysql = require('mysql'); //MOVED TO REQUEST-HANDLER
/* If the node mysql module is not found on your system, you may
 * need to do an "sudo npm install -g mysql". */

/* You'll need to fill the following out with your mysql username and password.
 * database: "chat" specifies that we're using the database called
 * "chat", which we created by running schema.sql.*/

// var dbConnection = mysql.createConnection({
//   user: "root",
//   password: "",
//   database: "chat" THIS BLOCK WAS MOVED TO THE REQUEST - HANDLER
// });

// dbConnection.connect();
// var tests = {username: "tyler", message : "my message", roomname: "my room"}
// dbConnection.query("INSERT INTO messages SET ?", tests, function(err, result){
//   console.log(result);
// });
// exports.dbConnection = dbConnection;
/* Now you can make queries to the Mysql database using the
 * dbConnection.query() method.
 * See https://github.com/felixge/node-mysql for more details about
 * using this module.*/

/* You already know how to create an http server from the previous
 * assignment; you can re-use most of that code here. */

var http = require("http");
var url = require('url');
var rh = require('./chat_/request-handler');
var connect = rh.dbConnection();
connect.connect();

var requestListener = function (request, response) {
  var statusCode = 200;
  var defaultCorsHeaders = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10
  };
  var headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";

  response.writeHead(statusCode, headers);

  var urlPath = url.parse(request.url).pathname;
  var splitPath = urlPath.split('/');
  splitPath.shift();
  console.log("Request Type: ", request.method);
  if(request.method === 'POST'){
    if(splitPath[0] === 'messages'){
      rh.handlePostMessage(request, splitPath[1], connect);
      response.end("Post Message Handled");
    }
  } else if (request.method === 'GET'){
    if(splitPath[0] === 'messages') {
      rh.handleGetMessages(request, response, splitPath[1]);
      response.end();
    } else if(splitPath[0] === 'chatrooms'){
      rh.handleGetChatrooms(request, response);
      response.end();
    } else {
      rh.handleStaticRequests(request, response);
    }
  } else{
      response.writeHead(200, headers);
      response.end();
  }

};

var port = 8080;

var ip = "127.0.0.1";

var server = http.createServer(requestListener);
server.on('connection', function(){
  rh.firstConnection();
});
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);


