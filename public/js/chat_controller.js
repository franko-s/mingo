function mainController($scope,'ChatManager','SocketService' ){
	var user = {'name':'Rico', 'fbId':'suave'};
	SocketService.connect();
	SocketService.sendName(user);
	$('#myModal').modal({
		keyboard: false
	});

	$('#myTab a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	});

	var msgs = ChatManager.currentChats;
	$scope.msgs = msgs;
}
