function changePage(id){
	$('.page.active').removeClass('active');
	$('#'+id).addClass('active');
}
function mainController($scope,SocketService,Feed){
	$scope.userName;
	$scope.feeds = Feed.query();
	$scope.newFeed = function () {
        $scope.feed = new Feed();//new Feed();
		$scope.feed.category = 'Category';			
		$scope.feed.img='http://www.bubble-jobs.co.uk/blog/wp-content/uploads/2012/12/profile.jpg';
    };
	$scope.newFeed();
	
	$scope.categories = ['Sports','Movie','travel','workout','Food'];
	$scope.isInvalidCategory = function(){
		return $scope.feed.category == 'category';
	}
	$scope.login = function(){
		SocketService.connect();
		SocketService.sendName($scope.userName);
		changePage('chatter');
	};
	
	$scope.$on('new-names', function(event, names) {
		$scope.names = names;
		$scope.$apply();
	});
	
	$scope.$on('new-feed', function(event, feed) {
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
		$scope.feed.postedBy = $scope.userName;	
		Feed.save({}, $scope.feed, function (data) {});
		$scope.newFeed();
	}
}