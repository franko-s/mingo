
var MessageType = function(){
	this.announcement = 0;
	this.new_feed = 1;
	this.personal_message = 2;
	this.clients = 3;
	this.register = -1;
	this.factory = -2;
}, messageTypes = new MessageType();

var module = angular.module('Mingo', ['ngResource']).
factory('SocketService',['$rootScope','ChatManager',function($rootScope){

	this.socket;
	var self = this;
	this.connected = false;
	this.names = {};
	this.messages = [];
	var connect = function(){
		self.socket = io.connect();

		self.socket.on('connect', function () {
			self.connected = true;
			console.log('connected');
		});

		self.socket.on(chatHandler.messageType.announcement, function (msg) {
			self.messages.push(msg);
			console.log(msg);
		});

		self.socket.on('new-feed', function (msg) {
			$rootScope.$broadcast('new-feed', msg); 
		});

		self.socket.on(chatHandler.messageType.clients, function (nicknames) {
			self.names = nicknames;
			$rootScope.$broadcast('new-names', self.names); 
		});

		self.socket.on(chatHandler.messageType.personal_message, function (msg) {
			self.names = nicknames;
			$rootScope.$broadcast(chatHandler.messageType.personal_message, msg); 
		});
		self.socket.on(chatHandler.messageType.factory, function (msg) {
			self.chatFactory = msg;
			ChatManager.setFactory(msg);
		});

	}

	var sendName = function(user){
		self.socket.emit(chatHandler.messageType.register, user, function (set) {});
	}
	var sendPersonalMessage = function(message){
		//message('me', $('#message').val());
		self.socket.emit(chatHandler.messageType.personal_message, message);
	}
	

	return {'sendMessage': sendPersonalMessage, 'sendName':sendName,'connect':connect };

}]).
factory('ChatManager', ['$resource', function ($resource) {
	var conversations = {},self = this, chatFactory;
	this.context = {};

	return{
		'startConversation': function(_with){
			conversation[_with] = [];			
		},
		'handleRecievedMessage': function(msg){
			if(!conversation[msg.from]){
				conversation[_with] = [];
			}
			conversation[_with].push(msh);
		},
		'handleSentMessage': function(msg){
			if(!conversation[msg.to]){
				conversation[_with] = [];
			}
			conversation[_with].push(msh);
		},
		'updateContext':function(key,value){
			self.context[key] = value;
			console.log(self.context);
		},
		'setFactory':function(_chatFactory){
			chatFactory = _chatFactory;
		},
		'createChat':function(body,to,from){
			chatFactory.createMessage(body,to,from);
		},
		'currentChats':conversations
	}
}]);