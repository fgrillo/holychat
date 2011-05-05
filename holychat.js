var express = require('express');
var jade = require('jade');
var io = require('socket.io');

var user_list = new Array();
var msg_list = new Array();

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

  console.log("Serving chat app");

  res.render('chat', {
    layout: 'chatLayout',
    title: 'Holy Chat!',
    data: {
      pageTitle: 'Holy Chat!'
    }
  });

});

app.post('/join', function(req, res) {
    var email = req.param('email');

    if (email != '' && search_user(email) == -1) {
        user_list.push([email, 0]);
        for (i = 0 ; i < user_list.length ; i++) {
            if (email != user_list[i][0]) {
                user_list[i][1] = 1;
            }
        }
        console.log('number of users: ' + user_list.length)
        res.send([user_list, msg_list.length]);
        msg_list.push(['', 'Usuário <b>' + email.substr(0, email.indexOf("@")) + '</b> entrou no chat']);
    }

});

app.post('/leave', function(req, res) {
    var email = req.param('email');

    console.log('email: ' + email)

    for (i = 0 ; i < user_list.length ; i++) {
        if (user_list[i][0] === email) {
            user_list.splice(i, 1);
            msg_list.push(['', 'Usuário <b>' + email + '</b> saiu do chat']);
        } else {
            user_list[i][1] = 1;
        }
    }

    console.log('user logged out! number of users: ' + user_list.length);

    res.send('success');
});

app.post('/message', function(req, res) {

    var email = req.param('email');
    var message = req.param('msg')

    if (message != '') {
        msg_list.push([email, message]);
        res.send('success');
        console.log('message saved! new lenght: ' + msg_list.length);
    } else {
        res.send('error');
    }

});

app.get('/get-messages', function(req, res) {
    
    var current = req.param('current');
    var email = req.param('email');

    var response = new Array();

    var index = search_user(email);

    if (index != -1 && user_list[index][1] == 1) {
        response.push(user_list);
        user_list[i][1] = 0;
    } else {
        response.push(new Array());
    }

    console.log('current: ' + current + ' lenght: ' + msg_list.length);
    if (msg_list.length > current) {
        response.push(msg_list.slice(current));
        response.push(msg_list.length);
        res.send(response);
    } else {
        res.send(null);
    }
});

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
console.log("Holy Chat Started on port %d", app.address().port);

