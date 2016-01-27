var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

/************************************************************************************
 "Comment" model. These are the comments left by users for a particular spot.
*************************************************************************************/
var CommentSchema = new Schema({
    body: String, // The comment body, i.e. a block of text
    author: String, // The name of the user who supplied the comment
    upvotes: {type: Number, default: 0}, // The number of upvotes for this comment
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Spot' } // The associated Spot
});

// Adds an upvote to a comment instance
CommentSchema.methods.upvote = function(c) {
    this.upvotes += 1;
    this.save(c);
};

module.exports = mongoose.model('Comment', CommentSchema)
