var ChatMessage = function()
{};
ChatMessage.prototype._with = null;
ChatMessage.prototype.me = null;
ChatMessage.prototype.sentAt = null;
ChatMessage.prototype.body = null;
ChatMessage.prototype.sentByMe= true;

var ShowMessages = function()
{
	this.firstTab, this.secondTab, this.thirdTab;
	var self = this;

	this.push = function(msgs)
	{
		if(firstTab==null)
		{
			self.firstTab = msgs;
		}
		else
		{
			var temp = self.firstTab;
			self.firstTab = msgs;
			if (temp['_with'] != msgs['_with']['fbId'])
			{
				if (self.secondTab!=null && self.secondTab['_with'] != msgs['_with']['fbId'])
				{
					self.thirdTab = self.secondTab
				}
				self.secondTab = temp;
			}
		}
	};

};

var ChatMessager = function()
{
	this.chats = {};
	this.showMessages = new ShowMessages();
	var self = this;

	this.handleMessage = function(msg)
	{
		if(!(self.chats[msg._with.fbId]))
		{
			//console.log(self.chats[msg._with.fbId]);
			var newMsgs = {};
			newMsgs._with = msg._with.fbId;
			newMsgs.messages = [];
			self.chats[msg._with.fbId] = newMsgs;
		}
		console.log(self.chats);
		((self.chats[msg._with.fbId]).messages).push(msg);

		//showMessages.push(self.chats[msg['_with']]);
	};

	this.startChat = function(_with)
	{
		if(!self.chats[_with.fbId])
		{
			self.chats[_with.fbId] = 
			{
					'with':_with.fbId, 
					'messages':[]
			};
		}
		return self.chats[_with.fbId];
	};
};

var module = angular.module('Mingo', ['ngResource']).
factory('ChatManager', 
		[ 
		 function ($resource) 
		 {
			 var chatMessages = new ChatMessager();
			 this.newChatMessage = function()
			 {
				 return new ChatMessage();
			 };
			 
			 this.startChat = function(_with){
				 return chatMessages.startChat(_with);
			 };
			 
			 this.handleMessage = function(msg){
				 return chatMessages.handleMessage(msg);
			 };
			 
			 this.chats = function(){
				 return chatMessages.chats;
			 };
			 
			 this.shownMessage = function(){
				 chatMessages.showMessages;
			 };
			 return this;
		 }
		 ]
).
factory(
		'SocketService',
		[
		 '$rootScope',
		 function($rootScope)
		 {
			 this.socket;
			 var self = this;
			 this.connected = false;
			 this.names = {};
			 this.messages = [];
			 var connect = function()
			 {
				 self.socket = io.connect();

				 self.socket.on(
						 'connect', 
						 function () 
						 {
							 self.connected = true;
							 console.log('connected');
						 }
				 );

				 self.socket.on(
						 'announcement', 
						 function (msg) 
						 {
							 self.messages.push(msg);
							 console.log(msg);
						 }
				 );

				 self.socket.on(
						 'new-feed', 
						 function (msg) 
						 {
							 $rootScope.$broadcast('new-feed', msg); 
						 }
				 );

				 self.socket.on(
						 'clients', 
						 function (nicknames) 
						 {
							 self.names = nicknames;
							 $rootScope.$broadcast('new-names', self.names); 
						 }
				 );

				 self.socket.on(
						 'personal message', 
						 function (message) 
						 {
							 $rootScope.$broadcast('personal message', message); 
						 }
				 );

			 }

			 var sendName = function(name)
			 {
				 self.socket.emit('nickname', name, function (set) {});
				 return false;
			 }
			 var sendPersonalMessage = function(message)
			 {
				 //message('me', $('#message').val());
				 self.socket.emit('personal message', message);
				 //clear();
				 //$('#lines').get(0).scrollTop = 10000000;
				 return false;
			 }

			 return {'sendMessage': sendPersonalMessage, 'sendName':sendName,'connect':connect };

		 }
		 ]
).
factory(
		'Feed', 
		[
		 '$resource', 
		 function ($resource) 
		 {
			 var Feed = $resource('/api/feed/:todoId', {}, {
				 update: { method: 'PUT'}
			 });
			 return Feed;
		 }
		 ]
).
factory(
		'FacebookSvr', 
		[
		 function() 
		 {
			 "use strict";
			 function FBPerms(perms) 
			 {
				 var as_array;

				 if (perms !== null) 
				 {
					 as_array = perms.split(',');
				 }
				 else 
				 {
					 as_array = [];
				 }

				 this.has = function (perms) 
				 {
					 var test_array = perms.split(','), valid = true;

					 $.each(
							 test_array, 
							 function (k, v) 
							 {
								 if (as_array.indexOf(v) < 0) 
								 {
									 valid = false;
								 }
							 }
					 );

					 return valid;
				 };

				 this.split = function () 
				 {
					 return as_array;
				 };
			 }

			 var self = this,

			 // Promises
			 pr_loaded = null,
			 pr_initialized = new $.Deferred(),
			 pr_authenticated = new $.Deferred(),

			 // Facebook info
			 fb_auth_response = null,
			 fb_granted = null,
			 fb_status = 'not_autorized',
			 fb_server_signed_request,

			 // Default settings
			 settings = {
				 url: '//connect.facebook.net/##LOCALE##/all.js',
				 locale: 'en_US',
				 status: true,
				 xfbml: true,
				 oauth: true,
				 authResponse: undefined,
				 fb_granted: null
			 };

			 this.setup=function (opts) 
			 {
				 $.extend(settings, opts);

				 fb_granted = new FBPerms(settings.fb_granted);
				 fb_auth_response = settings.authResponse;
				 fb_server_signed_request = settings.serverSignedRequest;

				 if (fb_auth_response && fb_auth_response.accessToken) 
				 {
					 fb_status = 'connected';
				 }
			 },
			 this.loaded=function () 
			 {
				 if (pr_loaded === null) 
				 {
					 pr_loaded = $.getScript(settings.url.replace('##LOCALE##', settings.locale));
				 }

				 return pr_loaded;
			 },
			 this.initialized=function () 
			 {
				 if (pr_initialized.state() === 'pending') 
				 {
					 this.loaded().done
					 (function () {
						 if (pr_initialized.state() === 'pending') 
						 {
							 FB.init({
								 appId: settings.appId,
								 channelUrl: settings.channelUrl,
								 status: settings.status,
								 xfbml: settings.xfbml,
								 oauth: settings.oauth
							 });

							 pr_initialized.resolve();
						 }
					 });
				 }

				 return pr_initialized;
			 },

			 /**
			  * Handles facebook authentication response
			  */
			 this.handle_auth_response=function (response) 
			 {
				 fb_status = response.status;
				 fb_auth_response = response.authResponse;
			 },

			 /**
			  * Check authentication status
			  */
			 this.authenticated=function () 
			 {
				 if (pr_authenticated.state() === 'pending') 
				 {
					 this.initialized().done
					 (function () {
						 if (pr_authenticated.state() === 'pending') 
						 {
							 if (fb_status !== 'connected') 
							 {
								 FB.getLoginStatus(function (response) 
										 {
									 self.handle_auth_response(response);
									 pr_authenticated.resolve();
										 }
								 );
							 }
							 else 
							 {
								 pr_authenticated.resolve();
							 }
						 }
					 });
				 }

				 return pr_authenticated;
			 },


			 this.update_granted=function () 
			 {
				 var out = new $.Deferred();

				 this.authenticated().done(
						 function () 
						 {
							 FB.api('/me/permissions', function (response) 
									 {
								 var new_perms = [];

								 if (!response || !response.data || !response.data[0]) 
								 {
									 out.resolve();
									 return;
								 }

								 $.each(
										 response.data[0], 
										 function (k, v) 
										 {
											 if (v) 
											 {
												 new_perms.push(k);
											 }
										 }
								 );

								 fb_granted = new FBPerms(new_perms.join(','));

								 out.resolve();
									 }
							 );
						 }
				 );

				 return out;
			 },

			 this.connected=function (perms, nologin) {
				 var promise = new $.Deferred();

				 this.authenticated().done(
						 function () 
						 {
							 function login() 
							 {
								 if (fb_granted.has(perms)) 
								 {
									 promise.resolve();
								 }
								 else if (nologin !== true) 
								 {
									 FB.login(
											 function (response) 
											 {
												 self.handle_auth_response(response);

												 if (response.status !== 'connected') 
												 {
													 promise.reject('login_rejection');
													 return;
												 }

												 self.update_granted().done
												 ( 
														 function () 
														 {
															 if (fb_granted.has(perms)) 
															 {
																 promise.resolve();
															 }
															 else 
															 {
																 promise.reject('partial_perms_after_login');
															 }
														 }
												 );
											 }, 
											 {
												 scope: perms
											 });
								 }
								 else 
								 {
									 promise.reject('not_trying_to_log_in');
								 }
							 }

							 if (!fb_granted.has(perms) && fb_status === 'connected') 
							 {
								 self.update_granted().done(login);
							 } 
							 else 
							 {
								 login();
							 }
						 }
				 );

				 return promise;
			 },

			 this.ready=function (fn) 
			 {
				 this.authenticated().done(fn);
			 },
			 this.getMutualFriendsCount = function(uid, callback)
			 {
				 FB.api('fql',
						 {'q':'select mutual_friend_count from user where uid="'+uid+'"'}, 
						 function (response) 
						 {
							 //alert(response);
							 console.log(response);
							 console.log(response['data'][0]['mutual_friend_count']);
							 callback(response['data'][0]['mutual_friend_count']);
						 }
				 );
			 },
			 this.uid=function (async) 
			 {
				 var out;

				 if (async !== true) 
				 {
					 out = fb_auth_response.userID;
				 } 
				 else 
				 {
					 out = new $.Deferred();

					 this.connected('installed').done
					 (function ()  {
						 out.resolve(fb_auth_response.userID);
					 });
				 }

				 return out;
			 },

			 this.redirect=function (to_url) 
			 {
				 var form = $('<form />').attr
				 ({
					 action: to_url,
					 method: 'post'
				 });

				 form.append($('<input />').attr({
					 name: 'signed_request',
					 value: fb_server_signed_request
				 }));

				 form.submit();
			 };
			 return this;
		 }
		 ]
);