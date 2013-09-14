exports.Model = function(){
	var self = this;
	feeds = [];
	users = [];
	
	this.addFeed = function(feed,callback){
		feed.id = feeds.length;
		feeds.push(feed);
		callback(false,feed);
	};
	this.addUser = function(user){
		user.id = users.length
		users.push(user);
		callback(false,user);
	};
	this.getFeeds = function(callback){
		callback(false,feeds);
	};
	this.getFeedById = function(id,callback){
		if(id>feeds.length||id<0){
			callback("feed doesn't exist",null);
		}
		callback(false,feeds[id]);
	};
	
	this.getUserById = function(id){
		return users[id];
	};
	this.getUsers = function(){
		return users;
	};
}