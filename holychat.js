var express = require('express');
var jade = require('jade');
var io = require('socket.io');

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

// Initialize http server
app.listen(8080);
console.log("Holy Chat Started on port %d", app.address().port);

// Initialize Socket.IO
var socket = io.listen(app);

socket.on('connection', function(client) {

  client.on('message', function(data) {
    console.log('Message received');
    console.log(data);

    if (data.action === 'message') {
      // set client email
      data.email = client.email;

      // broadcast message
      socket.broadcast(data);

    } else if (data.action === 'join') {
      // set client email
      client.email = data.email;

      // set that this is a new user
      data.newUser = true;

      // broadcast joined message
      socket.broadcast(data);

      // send all other clients to the new user
      for(var i in socket.clients) {
        var c = socket.clients[i];

        // Don't send duplicated message
        if (c.email === client.email) return;

        client.send({action: 'join', email: c.email, newUser: false});
      }
    }
  });

  client.on('disconnect', function() {
    var data = {};
    data.action = 'leave';
    data.email = client.email;

    client.broadcast(data);
  });
});
