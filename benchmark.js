// Include required modules
var sys = require('sys');
var utils = require('./utils.js');
var http = require('http');
var url = require('url');

var host = '10.62.9.17';
var port = 4567;
var users = 0;
var logged = 0;

// Get parameters from commmand line
if (process.argv[2] == 'help' || process.argv[2] == '?') {
   console.log(' ');
   console.log(' ');
   console.log('Benchmark script Help');
   console.log('---------------------');
   console.log(' ');
   console.log('usage: node benchmark.js (a) (b) (c) (d) (e) (f)'); 
   console.log(' ');
   console.log('  (a) - Number of users to spawn (one every 0,5 seconds until reach this number)');
   console.log('  (b) - Number of messages to sent by each user before it quits the chat');
   console.log('  (c) - Size of the messages the users will send in bytes');
   console.log('  (d) - Time interval between messages when sending (miliseconds)');
   console.log('  (e) - Time interval between getting messages from the server (miliseconds)');
   console.log('  (f) - User behavior is regular or random - 0 for regular and 1 for random');
   console.log(' ');
   console.log(' ');
   process.exit();
} 
var maxUsers = parseInt(process.argv[2]); 
var maxMsgs = parseInt(process.argv[3]);
var msgSize = parseInt(process.argv[4]); // in bytes
var sendInterval = parseInt(process.argv[5]); // In miliseconds
var receiveInterval = parseInt(process.argv[6]); // In miliseconds
var randomBehavior = parseInt(process.argv[7]); // 0 for regular and 1 for random behavior when sendind messages

var readyMessage = null

// Utility function that generate a msg messages
function generateMessage() {
    if (readyMessage != null) {
        return readyMessage;
    } else {
        readyMessage = '';
        for (var i = 0 ; i < msgSize ; i++) {
            readyMessage += 'a';
        }
        return readyMessage;
    }
}

// Function that emulates a user joining the chat, sendind a determined amount
// of messages and then logging out.
function user() {

    // Function for the user to join the chat room
    function joinAction() {

        var data = "";

        var join_req = http.request({host: host, port: port, method: 'post', path: '/join?email=' + testUserEmail}, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function() {
                result = JSON.parse(data);
                currentMessage = result[1];
            });
        });
        join_req.end();
	logged++;
    }

    // Function for the user to leave the chat room
    function leaveAction() {

        var data = "";

        var join_req = http.request({host: host, port: port, method: 'post', path: '/leave?email=' + testUserEmail + '&current=' + currentMessage}, function(res) {
            res.setEncoding('utf8');
        });
        join_req.end();
	logged--;	
	if (logged = 0) {
	   process.exit();
	}

    }

    // Function for the user to get the list of new messages from the server
    function getMessages() {
        var data = "";

        // This header is sent to the server simulating a header generated by
        // a browser (in this case Google Chrome) because otherwise the node.js
        // HTTP module would send a much smaller header than a regular browser
        var head_string = '{"host":"localhost:4567","connection":"keep-alive","referer":"http://localhost:4567/","origin":"http://localhost:4567","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24","content-type":"application/x-www-form-urlencoded","accept":"*/*","accept-encoding":"gzip,deflate,sdch","accept-language":"en-US,en;q=0.8","accept-charset":"ISO-8859-1,utf-8;q=0.7,*;q=0.3"}';
        var req_headers = JSON.parse(head_string);

        var message = generateMessage();

        var options = {host: host, port: port, method: 'get', path: '/get-messages?current=' + currentMessage + '&email=' + testUserEmail};
        var opt_size = JSON.stringify(options).length;

        options.headers = req_headers;

        var tsi = new Date();
        var get_req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // When receive data add them to a variable
                data += chunk;
            });
            res.on('end', function () {
                // This callback is called only when all the data parts are
                // ready for use
                var tsf = new Date();
                var result = JSON.parse(data);
                
                // Update the latest message number
                if (result) {
                    currentMessage = result[2];
                }

                // Log for the experiment
                var tsf_formatted = tsf.getHours() + ':' + tsf.getMinutes() + ':' + tsf.getSeconds() + ':' + tsf.getMilliseconds();
                var dt = tsf.getTime() - tsi.getTime();
                var allSize = JSON.stringify(res.headers).length + opt_size + head_string.length + data.length;
                console.log(tsf_formatted + ',' + userId + ',RECEIVE,' + users + ',' + allSize);
            });
        });
        get_req.end();
    }

    // Function for the user to send a message to the chat room
    function sendMessage() {
        var data = "";

        // This header is sent to the server simulating a header generated by
        // a browser (in this case Google Chrome) because otherwise the node.js
        // HTTP module would send a much smaller header than a regular browser
        var head_string = '{"host":"localhost:4567","connection":"keep-alive","referer":"http://localhost:4567/","origin":"http://localhost:4567","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24","content-type":"application/x-www-form-urlencoded","accept":"*/*","accept-encoding":"gzip,deflate,sdch","accept-language":"en-US,en;q=0.8","accept-charset":"ISO-8859-1,utf-8;q=0.7,*;q=0.3"}';
        var req_headers = JSON.parse(head_string);

        var message = generateMessage();

        var options = {host: host, port: port, method: 'post', path: '/message?email=' + testUserEmail + '&msg=' + message + '-' + numberSent};
        var opt_size = JSON.stringify(options).length;

        options.headers = req_headers;

        var tsi = new Date();
        var send_req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                // Log for experiment and test if the message limit is reached
                var tsf = new Date();
                var tsf_formatted = tsf.getHours() + ':' + tsf.getMinutes() + ':' + tsf.getSeconds() + ':' + tsf.getMilliseconds();
                var dt = tsf.getTime() - tsi.getTime();
                var allSize = JSON.stringify(res.headers).length + opt_size + head_string.length + data.length;
                
                //Control the number of messages sent
                numberSent++;
                if (numberSent == maxMsgs) {
                    clearInterval(si_get);
                    leaveAction();
                } else {
                    if (randomBehavior) {
                        // Send a new message between 1 and 5 seconds
                        setTimeout(sendMessage, Math.floor(Math.random() * 4000) + 1000);
                    } else {
                        // Send a new message on a regular period of time
                        // defined by the CLI parameter
                        setTimeout(sendMessage, sendInterval);
                    }
                }
                console.log(tsf_formatted + ',' + userId + ',SEND,' + users + ',' + allSize);
            });
        });
        send_req.end();
    }

  var testUserEmail = null;
  
  var tss = [];
  var userId = ++users;
  var testUserEmail = 'user' + userId + '@benchmark.com';
  var currentMessage = 0;
  var numberSent = 0;

  // User join the chat room
  joinAction();
  

  // This will start sending messages
  sendMessage();

  // Start retrieving messages on a interval determined by command line
  // parameter
  var si_get = setInterval(getMessages, receiveInterval);

}

// Start the amount of users configured via command line
// with a diference of 1 second each
for(var i=1 ; i<= maxUsers ; i++) {
  setTimeout(function() {
    user();
  }, i * 100);
}
