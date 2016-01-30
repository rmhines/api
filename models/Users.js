var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
  	username: {type: String, lowercase: true, unique: true},
    firstName: String,
    lastName: String,
    email: String,
  	hash: String,
  	salt: String
});

UserSchema.methods.setPassword = function(password){
	// Generate a "salt" to apply to the password
  	this.salt = crypto.randomBytes(16).toString('hex');
  	// Create a hash with the password, salt, and iterate 1000 times
  	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

// Returns true if the password entered matches the stored hash
UserSchema.methods.validPassword = function(password) {
  	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  	return this.hash === hash;
};

// Generate a JSON web token
UserSchema.methods.generateJWT = function() {
  	// Set token expiration at 60 days
  	var today = new Date();
  	var exp = new Date(today);
  	exp.setDate(today.getDate() + 60);

  	return jwt.sign({
    	_id: this._id,
    	username: this.username,
    	exp: parseInt(exp.getTime() / 1000),
  	}, 'SECRET');
};

mongoose.model('User', UserSchema);
