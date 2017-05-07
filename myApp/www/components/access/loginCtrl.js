angular.module('login', [])
.controller('LoginCtrl', function($scope, $stateParams, $http) {
	
	$scope.login = function() {
		var data = {
			email: 'mackclark311@gmail.com'
		}
		$http.post('http://localhost:8000/login', data).then(function(data) {
			console.log('data')
		});
	}
 	
})