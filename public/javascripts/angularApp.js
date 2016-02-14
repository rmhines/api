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
		function($scope, spots) {
  			$scope.spots = spots.spots;

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

			$scope.addVisit = function(spot) {
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
		function($scope, spots, spot) {
			$scope.spot = spot;

			$scope.addComment = function() {
  				if($scope.body === '') {
  					return;
  				}
  				spots.addComment(spot._id, {
    				body: $scope.body,
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

// Uses the Angular $http service to query the spots route
app.factory('spots', [
	'$http',
	function($http) {
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
            return $http.post('/spots', spot)
			.success(function(data) {
                service.spot.push(data);
            });
        };

        // Increment a spot's visit count
        service.addVisit = function(spot) {
            return $http.put('/spots/' + spot._id + '/addVisit', null)
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
        	return $http.post('/spots/' + id + '/comments', comment);
        };

        // Upvote a comment attached to a specific spot
        service.upvoteComment = function(spot, comment) {
  			return $http.put('/spots/' + spot._id + '/comments/'+ comment._id + '/upvote', null)
    		.success(function(data){
      			comment.upvotes += 1;
    		});
		};

		// Downvote a comment attached to a specific spot
        service.downvoteComment = function(spot, comment) {
  			return $http.put('/spots/' + spot._id + '/comments/'+ comment._id + '/downvote', null)
    		.success(function(data){
      			comment.upvotes -= 1;
    		});
		};

		return service;
	}
]);
