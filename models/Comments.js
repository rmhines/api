var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
  	body: String,
  	upvotes: {type: Number, default: 0},
  	spot: { type: mongoose.Schema.Types.ObjectId, ref: 'Spot' }
});

CommentSchema.methods.upvote = function(c) {
  	this.upvotes += 1;
  	this.save(c);
};

CommentSchema.methods.downvote = function(c) {
  	this.upvotes -= 1;
  	this.save(c);
};

mongoose.model('Comment', CommentSchema);
