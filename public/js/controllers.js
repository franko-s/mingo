function changePage(id)
{
	$('.page.active').removeClass('active');
	$('#'+id).addClass('active');
}
function mainController($scope,SocketService,Feed,FacebookSvr,ChatManager){
	$scope.user = {};
	$scope.context = {};
	$scope.feeds = Feed.query();

	var handleMutualFriends = function(count){
		feed['mutual_friend_count'] = count;
	};

	var fetchMutualFriends = function(index,feed){
		FacebookSvr.getMutualFriendsCount(feed.fbId, handleMutualFriends);
	};

	var getMutualFriendInfo = function()
	{
		$.each($scope.feeds, fetchMutualFriends);
		$scope.apply();
	};

	FacebookSvr.setup({
		appId: 161861727340161, // That's your app ID from your dev interface
		channelUrl: '//mingomongo.azurewebsites.net/channel.html', // see https://developers.facebook.com/docs/reference/javascript/#channel
		locale: 'en_US'
	});
	FacebookSvr.initialized();
	FacebookSvr.initialized().done(function () {
		console.log('Facebook is initialized');
	});

	var connectToServer = function()
	{
		SocketService.connect();
		SocketService.sendName($scope.user);
		//changePage('chatter');
	};

	$scope.login =function () 
	{
		//e.preventDefault();

		// Please note that the permission list has changed here
		FacebookSvr.connected('email,user_online_presence,user_about_me,user_birthday,user_status,user_interests,user_photos').done(function () {
			FB.api('/me?fields=id,name,birthday,email,education,gender,hometown,bio,about,picture,interests', function (response) {
				//alert(response);
				console.log(response);
				$scope.user.name = response.name;
				$scope.user.fbId = response.id;
				$scope.user.photoUrl = response.picture.data.url;
				console.log($scope.user);
				connectToServer();
				getMutualFriendInfo();
				changePage(feedPage);
				$scope.chats = ChatManager.chats();
			});
		});
		

		/*$scope.user.name = "Franko";
		$scope.user.fbId = "Jono";
		$scope.user.photoUrl ="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5pW83zaSVfZW0hqXtzg-m9F50IZDOZiJAYeifvSvGs3asmlJfHGiYsiM1";
		console.log($scope.user);
		connectToServer();*/
		
	};

	$scope.newFeed = function ()
	{
		$scope.feed = new Feed();//new Feed();
		$scope.feed.category = 'Category';
	};
	$scope.newFeed();

	$scope.categories = ['Night Life','Sports','Movie','Travel','workout','Food'];
	$scope.isInvalidCategory = function(){
		return $scope.feed.category == 'Category';
	}

	$scope.$on('new-names', function(event, names) {
		$scope.names = names;
		$scope.$apply();
	});

	$scope.$on('new-feed', function(event, feed) {
		FacebookSvr.getMutualFriendsCount(feed.fbId,function(count){
			feed['mutual_friend_count'] = count;
			$scope.apply();
		});
		$scope.feeds.push(feed);
		$scope.$apply();
	});

	$scope.$on('personal message', function(event, message) {
		/*FacebookSvr.getMutualFriendsCount(feed.fbId,function(count){
			feed['mutual_friend_count'] = count;
			$scope.apply();
		});*/
		//console.log("got it");
		//console.log(message);
		ChatManager.handleMessage(message);
		$scope.context._with = message._with;
		$scope.context.messages = ChatManager.chats()[$scope.context._with.fbId];
		$scope.$apply();
		$('#myModal').modal({
			keyboard : false
		});
	});

	$scope.startChat = function(feed)
	{
		$scope.context._with = feed.postedBy;
		console.log($scope.context._with);
		ChatManager.startChat($scope.context._with);
		$scope.context.messages = ChatManager.chats()[($scope.context._with).fbId];
		//changePage('chatter');
		$('#myModal').modal({
			keyboard : false
		});
	};

	var newMessage = function(body)
	{
		var msg = ChatManager.newChatMessage();
		msg.body = body;
		msg.me = $scope.user;
		msg._with = $scope.context._with;
		msg.sentAt = new Date();
		SocketService.sendMessage(msg);
		ChatManager.handleMessage(msg);
		$scope.context.messages = ChatManager.chats()[$scope.context._with.fbId];
		console.log($scope.context);
		console.log($scope.context.messages);
		console.log(msg);
	};

	$scope.handleSend = function()
	{
		newMessage($scope.newMessageToSend);
		$scope.newMessageToSend='';
	}

	$scope.selectCategory = function(elemen, $event)
	{
		$scope.feed.category = elemen;
	};

	$scope.postFeed = function()
	{
		//$scope.feeds.push($scope.feed);			
		$scope.feed.postedOn=new Date();
		$scope.feed.postedBy = $scope.user;	
		$scope.feed.img=$scope.user.photoUrl;
		$scope.feed.fbId = $scope.user.fbId;
		Feed.save({}, $scope.feed, function (data) {});
		$scope.newFeed();
	}

	$('body').on('touchmove', function (e) {
		if ($('#landing').has($(e.target)).length) e.preventDefault();
	});
}