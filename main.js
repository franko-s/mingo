var express = require('express')
  , sio = require('socket.io')
  , http = require('http')
  , https = require('https')
  , path = require('path')
  , mongoose = require('mongoose')
  , Model = require('./model.js').Model;

var model= new Model();
console.log(model);
var app = express();

app.configure(function () {
  app.use(express.static(__dirname + '/public'));
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);	
  app.set('view engine', 'html');
  app.set('views', __dirname);

  function compile (str, path) {
    return stylus(str)
      .set('filename', path)
      .use(nib());
  };
});

app.get('/', function(req,res){
    res.sendfile('temp.html');
});

/* Feed items */
app.get('/api/feed', function (req, res) {
    return model.getFeeds(function (err, feeds) {
        if (!err) {
			console.log(feeds);
            return res.send(feeds);
        }
        else {
            return console.log(err);
        }
    });
});

/* list by id*/
app.get('/api/feed/:id', function (req, res) {
    return model.getFeedById(req.params.id, function (err, feed) {
        if (!err) {
            return res.send(feed);
        }
        else {
            return console.log(err);
        }
    });
});

/* create */
app.post('/api/feed', function (req, res){
    console.log(req.body);
    feed = {
		postedBy:req.body.postedBy,
        category: req.body.category,
        body: req.body.body,
        img: req.body.img,
		postedOn:req.body.postedOn
    };
    model.addFeed(feed,function (err,feed) {
        if (!err) {
            io.sockets.emit('new-feed',feed);
			console.log(feed);
			return res.send(feed);
        } else {
            return console.log(err);
        }
    });
});

/* update */
app.put('/api/todo/:id', function (req, res){
    return model.getFeedById(req.params.id, function (err, feed) {
        console.log(req.body);
        feed.postedBy=req.body.postedBy,
        feed.category= req.body.category,
        feed.body= req.body.body,
        feed.img= req.body.img
        return feed;
    });
});

var httpSvr = http.createServer(app).listen(80, function () {
  //var addr = app.address();
  //console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

/**
 * Socket.IO server (single process only)
 */

var io = sio.listen(httpSvr)
  , clients = {};

io.sockets.on('connection', function (socket) {
   /**
   * broadcast a message
   */
  socket.on('user message', function (msg) {
    socket.broadcast.emit('user message', socket.nickname, msg);
  });
  
  /**
  *Handle a chat
  */
  socket.on('personal message', function (msg) {
	clients[msg.to].emit('personal message',msg);
  });


  socket.on('nickname', function (nick, fn) {
    if (clients[nick]) {
      fn(true);
    } else {
      fn(false);
      clients[nick] = socket.nickname = nick;
      socket.broadcast.emit('announcement', nick + ' connected');
      io.sockets.emit('clients', clients);
    }
  });

  socket.on('disconnect', function () {
    if (!socket.nickname) return;

    delete clients[socket.nickname];
    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('clients', clients);
  });
});
