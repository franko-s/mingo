var module = angular.module('Mingo', ['ngResource']).
factory('SocketService',['$rootScope',function($rootScope){
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

    	self.socket.on('announcement', function (msg) {
			self.messages.push(msg);
			console.log(msg);
    	});
		
		self.socket.on('new-feed', function (msg) {
			$rootScope.$broadcast('new-feed', msg); 
    	});

    	self.socket.on('clients', function (nicknames) {
			self.names = nicknames;
			$rootScope.$broadcast('new-names', self.names); 
    	});

	 }
	  
	  var sendName = function(name){
		self.socket.emit('nickname', name, function (set) {});
          return false;
	  }
	  var sendPersonalMessage = function(message){
		  //message('me', $('#message').val());
		  msg.local = 'to';
          self.socket.emit('personal message', message);
          //clear();
          //$('#lines').get(0).scrollTop = 10000000;
          return false;
	  }
	  
	  return {'sendMessage': sendPersonalMessage, 'sendName':sendName,'connect':connect };

}])
.factory('Feed', ['$resource', function ($resource) {
    var Feed = $resource('/api/feed/:todoId', {}, {
        update: { method: 'PUT'}
    });
    return Feed;
}]);