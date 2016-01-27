// BASE SETUP
// =============================================================================

// Call the needed packages
var express    	= require('express');        // Call express
var app        	= express();                 // Define the app using express
var bodyParser 	= require('body-parser');

// Establish database connection
var mongoose   	= require('mongoose');
mongoose.connect('mongodb://localhost/api');

// Import data models
var Spot 		= require('./app/models/spot');
var User 		= require('./app/models/user');
var Comment 	= require('./app/models/comment');

// Configure app to use bodyParser()
// This will let me get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // Set the port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // Get an instance of the express Router

// Middleware to use for all requests
router.use(function(req, res, next) {
    // Do logging
    console.log(req.method, req.url, req.body);
    next(); // Make sure it goes to the next routes and doesn't stop here
});

// Test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the HappyHourScour (working title!) API.' });   
});

// All routes that end in /spots
// -----------------------------------------------------------------------------
router.route('/spots')

    // Create a spot (accessed at POST http://localhost:8080/api/spots)
    .post(function(req, res) {
        
        var spot = new Spot(req.body);      // Create a new instance of the Spot model

        // Save the spot and check for errors
        spot.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Spot created!' });
        });        
    })

    // Get all the spots (accessed at GET http://localhost:8080/api/spots)
    .get(function(req, res) {
    	Spot.find(function(err, spots) {
    		if (err)
    			res.send(err);

    		res.json(spots);
    	});
    }
);

// Route for preloading spot objects
// Use Express's param() function to automatically load objects
router.param('spot_id', function(req, res, next, id) {
    var query = Spot.findById(id);

    // Use mongoose's query interface to interact with database
    query.exec(function (err, spot) {
        if (err) {
            return next(err);
        }
        if (!spot) {
            return next(new Error('Unable to locate spot.'));
        }

        req.spot = spot;
        return next();
    });
});

// Route for preloading comment objects
// Use Express's param() function to automatically load objects
// Gets the comment details from the Comment model and attaches it to the request object
router.param('comment', function(req, res, next, id) {
    var query = Comment.findById(id);

    // Use mongoose's query interface to interact with database
    query.exec(function (err, comment) {
        if (err) {
            return next(err);
        }
        if (!comment) {
            return next(new Error('Unable to locate comment.'));
        }

        req.comment = comment;
        return next();
    });
});

// All routes that end in /spots/:spot_id
// ------------------------------------------------------------------------------
router.route('/spots/:spot_id')

    // Get a spot (should already be in response body from .param middleware)
    // Attach all associated comments to the spot
    .get(function(req, res) {
        // Use populate function to retreive comments along with posts
        req.spot.populate('comments', function(err, spot) {
            if (err) {
                return next(err);
            }

            res.json(spot);
        });
    })

    // Update the spot with this id (accessed at GET http://localhost:8080/api/spots/:spot_id)
    .put(function(req, res, next) {
        var id = req.params.spot_id, body = req.body;
        Spot.findById(id, function(error, spot) {
            // Handle the error using the Express error middleware
            if (error) return next(error);

            // Render an error if not found
            if (!spot) {
                return res.status(404).json({
                    message: 'Spot with id ' + id + ' cannot be found.'
                });
            }

            // Update the spot model
            spot.update(body, function(error, spot) {
                if (error) return next(error);
                res.json({ message: 'Spot successfully updated!' });
            });
        });
    })

    // Delete the spot with this id (accessed at DELETE http://localhost:8080/api/spots/:spot_id)
    .delete(function(req, res) {
    	Spot.remove({
    		_id: req.params.spot_id
    	}, function(err, spot) {
    		if (err)
    			res.send(err);

    		res.json({ message: 'Spot successfully deleted!' });
    	});
    }
);

// PUT route for upvoting a spot
router.put('/spot/:spot_id/addVisit', function(req, res, next) {
    req.spot.addVisit(function(err, spot){
        if (err) {
            return next(err);
        }

        res.json(spot);
    });
});

// All routes that end in /users
// -----------------------------------------------------------------------------
router.route('/users')

    // Create a user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {
        
        var user = new User(req.body);      // Create a new instance of the User model

        // Save the user and check for errors
        user.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'User created!' });
        });        
    })

    // Get all the users (accessed at GET http://localhost:8080/api/users)
    // DEBUG only
    .get(function(req, res) {
        User.find(function(err, users) {
            if (err)
                res.send(err);

            res.json(users);
        });
    }
);

// All routes that end in /users/:user_id
// ------------------------------------------------------------------------------
router.route('/users/:user_id')

    // Get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.spot_id, function(err, user) {
            if (err)
                res.send(err);

            res.json(user);
        });
    })

    // Update the user with this id (accessed at GET http://localhost:8080/api/users/:user_id)
    .put(function(req, res, next) {
        var id = req.params.user_id, body = req.body;
        User.findById(id, function(error, user) {
            // Handle the error using the Express error middleware
            if (error) return next(error);

            // Render an error if not found
            if (!user) {
                return res.status(404).json({
                    message: 'User with id ' + id + ' cannot be found.'
                });
            }

            // Update the user model
            user.update(body, function(error, user) {
                if (error) return next(error);
                res.json({ message: 'User successfully updated!' });
            });
        });
    })

    // Delete the user with this id (accessed at DELETE http://localhost:8080/api/users/:user_id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'User successfully deleted!' });
        });
    }
);

// POST route for commenting -- sets author of comment
router.post('/spots/:spot_id/comments', function(req, res, next) {
    var comment = new Comment(req.body);
    comment.spot = req.spot;
    comment.author = req.payload.username;

    comment.save(function(err, comment){
        if(err){
            return next(err);
        }

        req.spot.comments.push(comment);
        req.spot.save(function(err, spot) {
            if(err){
                return next(err);
            }

            res.json(comment);
        });
    });
});

// PUT route for upvoting a comment
router.put('/spots/:spot_id/comments/:comment/upvote', function(req, res, next) {
    req.comment.upvote(function(err, comment){
        if (err) {
            return next(err);
        }

        res.json(comment);
    });
});

// REGISTER ALL ROUTES -------------------------------
// All routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Now listening on port ' + port);
