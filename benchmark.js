var sys = require('sys');
var utils = require('./utils.js');
var http = require('http');
var url = require('url');

var host = '127.0.0.1';
var port = 4567;
var users = 0;

var randomMessage = "Lorem+Ipsum+is+simply+dummy+text+of+the+printing+and+typesetting+industry.+Lorem+Ipsum+has+been+the+industry's";

function generateRandomMessage() {
  var extraSize = parseInt(Math.random() * 100);
  return "Benchmark+Message:+" + randomMessage.substring(0, extraSize);
}


function user() {

    function joinAction() {
        var join_req = http.request({host: host, port: port, method: 'post', path: '/join?email=' + testUserEmail}, function(res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var result = JSON.parse(chunk);
                console.log('BODY: ' + result[1]);
            });
        });
        join_req.end();
    }
    function getMessages() {
        var get_req = http.request({host: host, port: port, method: 'get', path: '/get-messages?current=' + currentMessage + '&email=' + testUserEmail}, function(res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);
            });
        });
        get_req.end();
    }

    function sendMessage() {
        message = generateRandomMessage();

        var send_req = http.request({host: host, port: port, method: 'post', path: '/message?email=' + testUserEmail + '&msg=' + message}, function(res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);
            });
        });
        
        send_req.end();
    }


    function leaveAction() {
        var leave_req = http.request({host: host, port: port, method: 'post', path: '/leave?email=' + testUserEmail}, function(res) {
            // console.log('STATUS: ' + res.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);
            });
        });
        leave_req.end();
    }


  var testUserEmail = null;
  
  var tss = [];

  var testUserEmail = 'user' + ++users + '@benchmark.com';
  var currentMessage = 0;

  joinAction();


  
  // ws.onmessage = function(message) {
  //   var payload = utils.decode(message.data)[0];
  // 
  //   if (joined == false) {
  //     testUserEmail = 'user' + ++users + '@benchamrk.com';
  //     ws.send(utils.encode({action: 'join', email: testUserEmail}));
  // 
  //     joined = true;
  // 
  //   } else if (payload.substr(0, 3) === '~j~') {
  //     var data = JSON.parse(payload.substr(3));
  // 
  //     if (data.action === 'join' && data.email === testUserEmail) {
  //       setInterval(function() {
  //         tss.push(new Date());
  //         ws.send(utils.encode({action: 'message', message: generateRandomMessage()}));
  //       }, 100);
  // 
  //     } else if (data.action === 'message' && data.email === testUserEmail) { 
  //         var d = new Date();
  //         var ts = d.getDay() + '/' + d.getMonth() + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();

  //         var sended = tss.shift();
  //         var dt = d.getTime() - sended.getTime();

  //         console.log(ts + ',' + users + ',' + payload.length + ',' + dt);
  //     }
  //   } else if (payload.substr(0, 3) === '~h~') {
  //     ws.send(utils.encode('~h~' + ++heartBeats));
  //   }
  // }
}

for(var i=1; i<=1; i++) {
  setTimeout(function() {
    user();
  }, i * 1100);
}
