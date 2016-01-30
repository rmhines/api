var app = angular.module('meanNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		// Set up a home state
  		$stateProvider.state('home', {
      		url: '/home',
      		templateUrl: '/home.html',
      		controller: 'MainCtrl',
      		resolve: {
    			spotPromise: [
    				'spots', 
    				function(spots) {
      					return spots.getAll();
    				}
    			]
  			}
    	}).state('spots', {
  			url: '/spots/{id}',
  			templateUrl: '/spots.html',
  			controller: 'SpotsCtrl',
  			resolve: {
    			spot: [
    				'$stateParams', 
    				'spots', 
    				function($stateParams, spots) {
      					return spots.get($stateParams.id);
    				}
    			]
  			}
		}).state('login', {
  			url: '/login',
  			templateUrl: '/login.html',
  			controller: 'AuthCtrl',
  			onEnter: ['$state', 'auth', function($state, auth) {
    			if (auth.isLoggedIn()) {
      				$state.go('home');
    			}
  			}]
		}).state('register', {
  			url: '/register',
  			templateUrl: '/register.html',
  			controller: 'AuthCtrl',
  			onEnter: ['$state', 'auth', function($state, auth) {
    			if (auth.isLoggedIn()) {
      				$state.go('home');
    			}
  			}]
		});

  		// For unkown states reroute to home
  		$urlRouterProvider.otherwise('home');
	}
]);

app.controller(
	'MainCtrl', 
	[
		'$scope',
		'spots',
		'auth',
		function($scope, spots, auth) {
  			$scope.spots = spots.spots;
  			$scope.isLoggedIn = auth.isLoggedIn;

			$scope.addSpot = function() {
  				if(!$scope.title || $scope.title === '') {
  					return;
  				}
  				if($scope.link && $scope.link !== '') {
  					if (!/^(f|ht)tps?:\/\//i.test($scope.link)) {
      					$scope.link = "http://" + $scope.link;
   					}
  				}
  				spots.create({
    				title: $scope.title,
    				link: $scope.link,
  				});
  				$scope.title = '';
  				$scope.link = '';
			};

			$scope.incrementVisits = function(spot) {
  				spots.addVisit(spot);
			};

		}
	]
);

app.controller(
	'SpotsCtrl', 
	[
		'$scope',
		'spots',
		'spot',
		'auth',
		function($scope, spots, spot, auth) {
			$scope.spot = spot;
			$scope.isLoggedIn = auth.isLoggedIn;;

			$scope.addComment = function() {
  				if($scope.body === '') {
  					return;
  				}
  				spots.addComment(spot._id, {
    				body: $scope.body,
    				author: 'user',
  				}).success(function(comment) {
    				$scope.spot.comments.push(comment);
  				});
  				$scope.body = '';
			};

			$scope.incrementUpvotes = function(comment) {
                spots.upvoteComment(spot, comment);
            };

            $scope.decrementUpvotes = function(comment) {
                spots.downvoteComment(spot, comment);
            };
		}
	]
);

// Authentication controller
app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
  		$scope.user = {};

  		$scope.register = function() {
    		auth.register($scope.user).error(function(error){
          		$scope.error = error;
        	}).then(function() {
          		$state.go('home');
        	});
      	};

      	$scope.logIn = function() {
        	auth.logIn($scope.user).error(function(error) {
          		$scope.error = error;
        	}).then(function() {
          		$state.go('home');
        	});
      	};
    }
]);

// Simple navbar controller that exposes isLoggedIn, currentUser,
// and logOut methods from the auth factory
app.controller(
	'NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth) {
  		$scope.isLoggedIn = auth.isLoggedIn;
  		$scope.currentUser = auth.currentUser;
  		$scope.logOut = auth.logOut;
	}
]);

// Auth factory service
app.factory('auth', ['$http', '$window', function($http, $window) {
   	var auth = {};

   	// Setter for user token
	auth.saveToken = function (token) {
	  	$window.localStorage['mean-news-token'] = token;
	};

	// Getter for user token
	auth.getToken = function () {
	  	return $window.localStorage['mean-news-token'];
	};

	// Return true if user is logged in
	auth.isLoggedIn = function() {
	  	var token = auth.getToken();

	  	if(token) {
	    	var payload = JSON.parse($window.atob(token.split('.')[1]));

	    	return payload.exp > Date.now() / 1000;
	  	} else {
	    	return false;
	  	}
	};

	// Returns the username of the currently logged in user
	auth.currentUser = function(){
	  	if(auth.isLoggedIn()) {
	    	var token = auth.getToken();
	    	var payload = JSON.parse($window.atob(token.split('.')[1]));

	    	return payload.username;
	  	}
	};

	// Posts a user to the /register route and saves the returned token
	auth.register = function(user) {
	  	return $http.post('/register', user).success(function(data) {
	    	auth.saveToken(data.token);
	  	});
	};

	// Posts a user to the /login route and saves the returned token
	auth.logIn = function(user) {
	  	return $http.post('/login', user).success(function(data){
	    	auth.saveToken(data.token);
	  	});
	};

	// Log out function that removes the user token from local storage,
	// effectively logging the user out
	auth.logOut = function() {
	  	$window.localStorage.removeItem('mean-news-token');
	};

  	return auth;
}]);

// Uses the Angular $http service to query the spots route
app.factory('spots', [
	'$http',
	'auth',
	function($http, auth) {
  		var service = {
	    	spots: []
		};

		// Retrieve all spots
        service.getAll = function() {
        	// Use success() to define what executes when request returns
            return $http.get('/spots').success(function(data) {
            	// Deep copy ensures global update
                angular.copy(data, service.spots);
            });
        };

        // Create new spot
        service.create = function(spot) {
            return $http.spot('/spots', spot, {
            	headers: {
            		Authorization: 'Bearer ' + auth.getToken()
            	}
            }).success(function(data) {
                service.spot.push(data);
            });
        };

        // Increment a spot's visit count
        service.addVisit = function(spot) {
            return $http.put('/spots/' + spot._id + '/addVisit', null, {
            	headers: {
            		Authorization: 'Bearer ' + auth.getToken()
            	}
            })
        	.success(function(data) {
                spot.visits += 1;
            });
        };

        // Retrieve a single spot
        service.get = function(id) {
            return $http.get('/spots/' + id).then(function(res) {
                return res.data
            });
        };

        // Add a comment to a spot
        service.addComment = function(id, comment) {
        	return $http.post('/spots/' + id + '/comments', comment, {
        		headers: {
        			Authorization: 'Bearer ' + auth.getToken()
        		}
        	});
        };

        // Upvote a comment attached to a specific spot
        service.upvoteComment = function(spot, comment) {
  			return $http.put('/spots/' + spot._id + '/comments/'+ comment._id + '/upvote', null, {
  				headers: {
  					Authorization: 'Bearer ' + auth.getToken()
  				}
  			})
    		.success(function(data){
      			comment.upvotes += 1;
    		});
		};

		// Downvote a comment attached to a specific spot
        service.downvoteComment = function(spot, comment) {
  			return $http.put('/spots/' + spot._id + '/comments/'+ comment._id + '/downvote', null, {
  				headers: {
  					Authorization: 'Bearer ' + auth.getToken()
  				}
  			})
    		.success(function(data){
      			comment.upvotes -= 1;
    		});
		};

		return service;
	}
]);
