var express = require('express')
, sio = require('socket.io')
, http = require('http')
, https = require('https')
, path = require('path')
, mongoose = require('mongoose')
, Model = require('./model.js').Model;

var model= new Model();
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
	res.sendfile('chat.html');
});

var ChatHandler = function(){

	//Todo - add validation to user and to message
	//Todo - add success and failure callback capability

	var MessageType = function(){
		this.announcement = 0;
		this.new_feed = 1;
		this.personal_message = 2;
		this.clients = 3;
		this.register = -1;
		this.factory = -2;
	};

	this.messageType = new MessageType();

	var MsgFactory = function(){

		var Msg = function(){
			this.type = '';
			this.body = '';
			this.from = null;
			this.to = null;
			var self = this;
			this.toString = function(){
				return self.from + " sent " + self.body +" to " + self.to;
			}
		};

		this.newMessage = function(){
			return new Msg();
		}

		// creates a new personal message
		this.createMessage = function(body,to,from){
			var msg = new Msg();
			msg.type = this.messageType.personal_message;
			msg.body = body;
			msg.to = to;
			msg.from = from;
			return msg;
		}

		this.createRegisterMessage = function(body,from){
			var msg = new Msg();
			msg.type = this.messageType.register;
			msg.from = from;
			msg.body = body;
			return msg;
		}
	}

	var Users = function(){
		//a user template
		var userList = [];

		this.getUser = function(fbId){
			for( user in userList){
				if(user.fbId == fbId){
					return user;
				}
			}
			return null;
		};
		
		this.removeUser = function(user){
			var idx = userList.indexOf(user);
			if(idx >= 0&&userList.indexOf(user) < userlist.length)
				delete userList[userList.indexOf(user)];
			return userList;
		};

		this.addUser = function(user){
			userList.push(user);
		};

		this.toString = function(){
			var users = '[';
			for(user in userList){
				users += '\n'+user.toString();
			}
			users+']';
			return users;
		};

		this.getAllUsers = function(){
			return userList;
		}

	};

	var UserFactory = function(){
		var User = function(){
			this.name = '';
			this.fbId = '';
			var self = this;
			this.toString = function(){
				return "The User is " + self.Name + " at position " + self.id;
			}
		};

		this.NewUser = new User();
		this.createUser = function(name,fbId){
			var user = new User();
			user.name = name;
			user.fbId = fbid;
			return user;
		}
	};

	var getUserSocket = function(user){
		return io.sockets.sockets[user.fbId];
	};

	this.getMessageFactory = function(){
		return new MsgFactory();
	};

	this.users = new Users();
	this.userFactory  = new UserFactory();
	this.addUser = this.users.addUser;
	this.getUserSocket = this.users.getAllUsers;
	this.sendPersonalMessage = function(msg){
		console.log(msg);

		//Make sure message has a to attribute
		if(msg && msg.to){
			var toUser = getUser(msg.to);

			if(toUser){
				var socket = getUserSocket(toUser);

				if(socket){
					socket.emit(messageType.personal_message, msg);
				}
			}
		}
	};

};

var port = process.env.PORT || 1337;
var httpSvr = http.createServer(app).listen(port, function () {
	//var addr = app.address();
	//console.log('   app listening on http://' + addr.address + ':' + addr.port);
});

var io = sio.listen(httpSvr)
, chatHandler = new ChatHandler();

io.configure(function () {                //Added
	io.set('transports', ['xhr-polling']);  //Added
});

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
	socket.on(chatHandler.messageType.personal_message, function (msg) {
		chatHandler.sendPersonalMessage(msg);
	});


	socket.on(chatHandler.messageType.register, function (user, fn) {
		socket.id = user.fbId;
		chatHandler.addUser(chatHandler.userFactory.createUser(user.name,user.fbId));
		socket.broadcast.emit(chatHandler.messageType.announcement, userId + ' connected');
		socket.emit(chatHandler.messageType.factory, new chatHandler.MsgFactory());
	});

	socket.on('disconnect', function () {
		if (!socket.nickname) return;

		//delete clients[socket.nickname];
		//socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
		//socket.broadcast.emit('clients', clients);
	});
});
