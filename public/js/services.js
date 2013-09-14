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

    	self.socket.on('user message', message);
    	self.socket.on('reconnect', function () {
    		message('System', 'Reconnected to the server');
    	});

    	self.socket.on('reconnecting', function () {
    		message('System', 'Attempting to re-connect to the server');
    	});

    	self.socket.on('error', function (e) {
    		message('System', e ? e : 'A unknown error occurred');
    	});
	 }

      function message (from, msg) {
        $('#lines').append($('<p>').append($('<b>').text(from), msg));
      }
	  
	  var sendName = function(name){
		self.socket.emit('nickname', name, function (set) {
            if (!set) {
              clear();
              return $('#chat').addClass('nickname-set');
            }
            $('#nickname-err').css('visibility', 'visible');
          });
          return false;
	  }
	  
	  function clear () {
          $('#message').val('').focus();
      };
	  var sendMessage = function(message){
		  message('me', $('#message').val());
          self.socket.emit('user message', $('#message').val());
          clear();
          $('#lines').get(0).scrollTop = 10000000;
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
	  
	  return {'sendMessage': sendMessage, 'sendName':sendName,'connect':connect };

}])
.factory('Feed', ['$resource', function ($resource) {
    var Feed = $resource('/api/feed/:todoId', {}, {
        update: { method: 'PUT'}
    });
    return Feed;
}]);