function changePage(id){
	$('.page.active').removeClass('active');
	$('#'+id).addClass('active');
}
function mainController($scope,SocketService,Feed,FacebookSvr){
	$scope.user = {};
	$scope.feeds = Feed.query();
	
	var getMutualFriendInfo = function(){
		for(var feed:$scope.feeds){
			FacebookSvr.getMutualFriendsCount(feed.fbId, function(count){
				feed['mutual_friend_count'] = count;
			});
		}
	}
	
	FacebookSvr.setup({
		appId: 161861727340161, // That's your app ID from your dev interface
		channelUrl: '//mingomongo.azurewebsites.net/channel.html', // see https://developers.facebook.com/docs/reference/javascript/#channel
		locale: 'en_US'
	});
	FacebookSvr.initialized();
	FacebookSvr.initialized().done(function () {
		console.log('Facebook is initialized');
	});
	
	var connectToServer = function(){
		SocketService.connect();
		SocketService.sendName($scope.user.name);
		changePage('chatter');
	};
	
	$scope.login =function () {
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
			});
		});
		getMutualFriendInfo();
	};
	
	$scope.newFeed = function () {
        $scope.feed = new Feed();//new Feed();
		$scope.feed.category = 'Category';
    };
	$scope.newFeed();
	
	$scope.categories = ['Night Life','Sports','Movie','Travel','workout','Food'];
	$scope.isInvalidCategory = function(){
		return $scope.feed.category == 'category';
	}
	
	$scope.$on('new-names', function(event, names) {
		$scope.names = names;
		$scope.$apply();
	});
	
	$scope.$on('new-feed', function(event, feed) {
		FacebookSvr.getMutualFriendsCount(feed.fbId,function(count){
			feed['mutual_friend_count'] = count;
		});
		$scope.feeds.push(feed);
		$scope.$apply();
	});
	
	$scope.startChat = function(to){
		$scope.to = to;
		$scope.msgs = [];
		changePage('chatter');
	};
	
	$scope.newMessage = function(body){
		var msg = {};
		msg.to = $scope.to;
		msg.body = body;
		msg.from = userName;
		msg.local = 'from';
		SocketService.sendPersonalMessage(msg);
	};
	
	$scope.selectCategory = function(elemen, $event){
		$scope.feed.category = elemen;
	};
	
	$scope.postFeed = function(){
		//$scope.feeds.push($scope.feed);			
		$scope.feed.postedOn=new Date();
		$scope.feed.postedBy = $scope.user.name;	
		$scope.feed.img=$scope.user.photoUrl;
		$scope.feed.fbId = $scope.user.fbId;
		Feed.save({}, $scope.feed, function (data) {});
		$scope.newFeed();
	}
	
	$('body').on('touchmove', function (e) {
         if ($('#landing').has($(e.target)).length) e.preventDefault();
	});
}