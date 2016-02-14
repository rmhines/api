var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

module.exports = router;

var Spot = mongoose.model('Spot');
var Comment = mongoose.model('Comment');

// GET route for home page
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the HappyHourScour (working title!) API.' });
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
router.post('/spots', function(req, res, next) {
  	var spot = new Spot(req.body);

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
  	// Use populate function to retreive comments along with spots
  	req.spot.populate('comments', function(err, spot) {
    	if (err) {
    		return next(err);
    	}

    	res.json(spot);
  	});
});

// PUT route for adding a visit to a spot
router.put('/spots/:spot/addVisit', function(req, res, next) {
  	req.spot.addVisit(function(err, spot) {
    	if (err) {
    		return next(err);
    	}

    	res.json(spot);
  	});
});

// PUT route for upvoting a comment
router.put('/spots/:spot/comments/:comment/upvote', function(req, res, next) {
  	req.comment.upvote(function(err, comment) {
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// PUT route for downvoting a comment
router.put('/spots/:spot/comments/:comment/downvote', function(req, res, next) {
  	req.comment.downvote(function(err, comment) {
    	if (err) {
    		return next(err);
    	}

    	res.json(comment);
  	});
});

// POST route for commenting
router.post('/spots/:spot/comments', function(req, res, next) {
  	var comment = new Comment(req.body);
  	comment.spot = req.spot;

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
router.post('/spots/:spot/comments', function(req, res, next) {
    var comment = new Comment(req.body);
    comment.spot = req.spot;

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


