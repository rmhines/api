var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var router = express.Router();
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

module.exports = router;

var Spot = mongoose.model('Spot');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');

// GET route for home page
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the HappyScour (working title!) API.' });
});

// GET route for spots
// req - Contains all request info made to the server
// res - Object used to respond to the client
router.get('/spots', function(req, res, next) {
  	Spot.find(function(err, spots){
    	if(err) {
    		return next(err);
    	}

    	res.json(spots);
  	});
});

// POST route for creating spots
router.post('/spots', auth, function(req, res, next) {
  	var spot = new Spot(req.body);
  	spot.author = req.payload.username;

  	spot.save(function(err, spot){
    	if(err) {
    		return next(err);
    	}

    	res.json(spot);
  	});
});

// DELETE route for deleting spots
router.delete('/spots/:spot', function(req, res) {
    Spot.remove({
        _id: req.params.spot
    }, function(err, spot) {
        if (err)
            res.send(err);

        res.json({ message: 'Spot successfully deleted!' });
    });
});

// Route for preloading spot objects
// Use Express's param() function to automatically load objects
router.param('spot', function(req, res, next, id) {
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


// GET route for returning a single spot
router.get('/spots/:spot', function(req, res) {
  	// Use populate function to retrieve comments along with spots
  	req.spot.populate('comments', function(err, spot) {
    	if (err) {
    		return next(err);
    	}

    	res.json(spot);
  	});
});

// PUT route for adding a visit to a spot
router.put('/spots/:spot/addVisit', auth, function(req, res, next) {
  	req.spot.addVisit(function(err, spot) {
    	if (err) {
    		return next(err);
    	}

    	res.json(spot);
  	});
});

// PUT route for upvoting a comment
router.put('/spots/:spot/comments/:comment/upvote', auth, function(req, res, next) {
  	req.comment.upvote(function(err, comment) {
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// PUT route for downvoting a comment
router.put('/spots/:spot/comments/:comment/downvote', auth, function(req, res, next) {
  	req.comment.downvote(function(err, comment) {
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// POST route for commenting -- sets author of comment
router.post('/spots/:spot/comments', auth, function(req, res, next) {
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

// DELETE route for deleting a comment
router.post('/spots/:spot/comments', auth, function(req, res, next) {
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

// POST route for creating a user given a username and password
router.post('/register', function(req, res, next) {
  	if(!req.body.username || !req.body.password) {
    	return res.status(400).json({message: 'Please fill out all fields.'});
  	}

  	var user = new User();

  	user.username = req.body.username;

  	user.setPassword(req.body.password)

  	user.save(function (err) {
    	if(err) {
    		return next(err);
    	}

    	return res.json({token: user.generateJWT()})
  	});
});

// POST route for authenticating the user and returning a token
router.post('/login', function(req, res, next) {
  	if(!req.body.username || !req.body.password) {
    	return res.status(400).json({message: 'Please fill out all fields.'});
  	}

  	passport.authenticate('local', function(err, user, info) {
    	if(err) {
    		return next(err);
    	}

    	if(user) {
      		return res.json({token: user.generateJWT()});
    	} else {
      		return res.status(401).json(info);
    	}
  	})(req, res, next);
});

// Use Express's param() function to automatically load object
router.param('spot', function(req, res, next, id) {
  	var query = Spot.findById(id);

  	// Use mongoose's query interface to interact with database
  	query.exec(function (err, spot) {
    	if (err) {
    		return next(err);
    	}
    	if (!spot) {
    		return next(new Error('Unable to find spot.'));
    	}

    	req.spot = spot;
    	return next();
  	});
});


