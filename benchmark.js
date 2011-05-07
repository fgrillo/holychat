var sys = require('sys');
var utils = require('./utils.js');
var http = require('http');
var url = require('url');

var host = '127.0.0.1';
var port = 4567;
var users = 0;

var maxMsgs = parseInt(process.argv[3]);
var maxUsers = parseInt(process.argv[2]);

var randomMessage = "Lorem+Ipsum+is+simply+dummy+text+of+the+printing+and+typesetting+industry.+Lorem+Ipsum+has+been+the+industry's";

var randomMessagesSize = 0;
var randomMessages = [];

function generateRandomMessage() {
  var extraSize = parseInt(Math.random() * 100);

  if (randomMessagesSize == 100) {
    return randomMessages[extraSize];

  } else {
    var m = "Benchmark Message: " + randomMessage.substring(0, extraSize);
    randomMessages.push(m);

    return m;
  }
}

function user() {

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

    }

    function getMessages() {
        var data = "";

        var head_string = '{"host":"localhost:4567","connection":"keep-alive","referer":"http://localhost:4567/","origin":"http://localhost:4567","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24","content-type":"application/x-www-form-urlencoded","accept":"*/*","accept-encoding":"gzip,deflate,sdch","accept-language":"en-US,en;q=0.8","accept-charset":"ISO-8859-1,utf-8;q=0.7,*;q=0.3"}';
        var req_headers = JSON.parse(head_string);

        var message = generateRandomMessage();

        var options = {host: host, port: port, method: 'get', path: '/get-messages?current=' + currentMessage + '&email=' + testUserEmail};
        var opt_size = JSON.stringify(options).length;

        options.headers = req_headers;

        var tsi = new Date();
        var get_req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                var tsf = new Date();
                var result = JSON.parse(data);
                
                if (result) {
                    currentMessage = result[2];
                }

                var tsf_formatted = tsf.getHours() + ':' + tsf.getMinutes() + ':' + tsf.getSeconds() + ':' + tsf.getMilliseconds();
                var dt = tsf.getTime() - tsi.getTime();
                var allSize = JSON.stringify(res.headers).length + opt_size + head_string.length + data.length;
                console.log(tsf_formatted + ',RECEIVE,' + users + ',' + allSize);
            });
        });
        get_req.end();
    }

    function sendMessage() {
        var data = "";

        var head_string = '{"host":"localhost:4567","connection":"keep-alive","referer":"http://localhost:4567/","origin":"http://localhost:4567","x-requested-with":"XMLHttpRequest","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24","content-type":"application/x-www-form-urlencoded","accept":"*/*","accept-encoding":"gzip,deflate,sdch","accept-language":"en-US,en;q=0.8","accept-charset":"ISO-8859-1,utf-8;q=0.7,*;q=0.3"}';
        var req_headers = JSON.parse(head_string);

        var message = generateRandomMessage();

        var options = {host: host, port: port, method: 'post', path: '/message?email=' + testUserEmail + '&msg=' + message};
        var opt_size = JSON.stringify(options).length;

        options.headers = req_headers;

        var tsi = new Date();
        var send_req = http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                var tsf = new Date();
                var tsf_formatted = tsf.getHours() + ':' + tsf.getMinutes() + ':' + tsf.getSeconds() + ':' + tsf.getMilliseconds();
                var dt = tsf.getTime() - tsi.getTime();
                var allSize = JSON.stringify(res.headers).length + opt_size + head_string.length + data.length;
                numberSent++;
                if (numberSent == maxMsgs) {
                    clearInterval(si);
                }
                console.log(tsf_formatted + ',SEND,' + users + ',' + allSize + ',');
            });
        });
        send_req.end();
    }

  var testUserEmail = null;
  
  var tss = [];
  var testUserEmail = 'user' + ++users + '@benchmark.com';
  var currentMessage = 0;
  var numberSent = 0;

  joinAction();
  var si = setInterval(sendMessage, 1000);
  setInterval(getMessages, 2000);

}

for(var i=1 ; i<= maxUsers ; i++) {
  setTimeout(function() {
    user();
  }, i * 1100);
}
