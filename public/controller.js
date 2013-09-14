function mainController(SocketService){
	$scope.userName='';
	$scope.login = function(){
		SocketService.connect();
		SocketService.sendName($scope.userName);
	}
}