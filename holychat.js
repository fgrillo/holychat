// Include required modules
var express = require('express');
var jade = require('jade');
var exec = require('child_process').exec;

var user_list = new Array();
var msg_list = new Array();
var msg_counter_list = new Array();
var removedCounter = 0;
var allMessages = 0;
var dtMessages = 0;

// Command to get system usage information 
var getCpuCommand = "ps -p " + process.pid + " -u | grep " + process.pid;

// Function to print the server log on the standard output
function printLog() {
  var child = exec(getCpuCommand, function(error, stdout, stderr) {
       var d = new Date();
       var ts = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ':' + d.getMilliseconds();

      var s = stdout.split(/\s+/);
      var cpu = s[2];
      var memory = s[3];

      console.log(ts + ',' + user_list.length + ',' + memory + ',' + cpu + ',' + allMessages + ',' + dtMessages);

      dtMessages = 0;
  });
}

// Express - Configure App
var app = express.createServer();

app.configure(function() {
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('view engine', 'jade');
});

// Express - Routes
app.get('/', function(req, res) {

  res.render('chat', {
    layout: 'chatLayout',
    title: 'Holy Chat!',
    data: {
      pageTitle: 'Holy Chat!'
    }
  });

});

// Path for users to join the chat room
app.post('/join', function(req, res) {
    var email = req.param('email');

    if (email != '' && search_user(email) == -1) {

        // Add the new user to the user array an mark the other users to update
        // their user list.
        user_list.push([email, 0]);
        for (i = 0 ; i < user_list.length ; i++) {
            if (email != user_list[i][0]) {
                user_list[i][1] = 1;
            }
        }
        res.send([user_list, (msg_list.length + removedCounter)]);

        // Add a message telling to the user that a new user joined the chat room
        msg_list.push(['', 'Usuário <b>' + email.substr(0, email.indexOf("@")) + '</b> entrou no chat']);
        msg_counter_list.push(user_list.length);
    }

});


// Path for users to leav the chat room
app.post('/leave', function(req, res) {
    var email = req.param('email');
    var current = req.param('current');

    for (i = 0 ; i < user_list.length ; i++) {
        // remove the user from users array and add a message to all users
        if (user_list[i][0] === email) {
            user_list.splice(i, 1);
            if (user_list.length > 0) {
                
                var totalMessages = (msg_list.length + removedCounter);
                if (totalMessages > current) {
                    // If there are new messages
                    var realPosition = current - removedCounter;

                    for(var j = realPosition ; j < msg_list.length ; j++) {
                        msg_counter_list[j]--;
                    }
                }

                msg_list.push(['', 'Usuário <b>' + email + '</b> saiu do chat']);
                msg_counter_list.push(user_list.length);

            } else {
                msg_list = new Array()
                msg_counter_list = new Array()
		removedCounter = 0;
            }
        } else {
            // Mark all other users to update their user list.
            user_list[i][1] = 1;
        }
    }
    
    // respond success to the user browser.
    res.send('success');
});


// Path for users to send a message to the chat room
app.post('/message', function(req, res) {

    var email = req.param('email');
    var message = req.param('msg')

    if (message != '') {
        // Add message to the message array and update some log variables
        msg_list.push([email, message]);
        msg_counter_list.push(user_list.length);
        dtMessages++;
        allMessages++;

        // respond success to the request
        res.send('success');
    } else {
        // if there is no content responde error to the request
        res.send('error');
    }

});

// Path for users to get the lastest messages from the server
app.get('/get-messages', function(req, res) {
    
    var current = req.param('current');
    var email = req.param('email');

    var response = new Array();

    var index = search_user(email);

    if (index != -1 && user_list[index][1] == 1) {
        // If the this user's user list is outdated, add it to the response
        response.push(user_list);
        user_list[i][1] = 0;
    } else {
        response.push(new Array());
    }

    // Increment log variables
    dtMessages++;
    allMessages++;

    var totalMessages = (msg_list.length + removedCounter);
    if (totalMessages > current) {
        // If there are new messages
        var realPosition = current - removedCounter;
        response.push(msg_list.slice(realPosition));

        for(var j = realPosition ; j < msg_list.length ; j++) {
            msg_counter_list[j]--;
        }

        response.push(msg_list.length + removedCounter);
        res.send(response);
    } else {
        // If there is no new message send an empty response
        res.send(null);
    }
});

// Utility function for searching the user on the user array
function search_user(email) {
    for (i = 0 ; i < user_list.length ; i++) {
        if (user_list[i][0] == email) {
            return i;
        }
    }
    return -1;
}

// Initialize http server
app.listen(4567);

setInterval(function() {
    for(var k = 0 ; k < msg_list.length ; k++) {
        if (msg_counter_list[k] <= 0) {
            msg_list.splice(k, 1);
            msg_counter_list.splice(k, 1);
            removedCounter++;
        } 
    }
}, 500);


// Log CPU and memory usage and communication ammount
setInterval(function() {
  /*console.log('==================================')
  console.log('--- msg_list ---'); console.log(msg_list);
  console.log('--- msg_counter_list ---'); console.log(msg_counter_list);
  console.log('--- user_list ---'); console.log(user_list);
  console.log('Msg_list size: ' + msg_list.length);
  console.log('RemovedCounter: ' + removedCounter);
  console.log('Total: ' + (removedCounter + msg_list.length));
  console.log('==================================')*/
  printLog();
}, 500);

