var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

/************************************************************************************
 "User" model. This document model outlines the information for a given user account.
*************************************************************************************/
var UserSchema = new Schema({
    username: {type: String, lowercase: true, unique: true},
    firstName: String,
    lastName: String,
    email: String,
    visits: Number // The tally of "visits" or unique reviews within the app
});

module.exports = mongoose.model('User', UserSchema)
