var mongoose = require('mongoose');

/************************************************************************************
 "Spot" model. Spots are the food or drink venues which reportedly have happy hours.
*************************************************************************************/
var SpotSchema = new mongoose.Schema({
  	name: String, // The name of the bar or restaurant
    website: String, // The URL for the venue's website, if available
    type: String, // Type of venue, e.g. restaurant, bar, cafe
    theme: String, // The style or theme of the food or drink, e.g. "German" or "Tex-Mex"
    location: {
        city: String, // The city where the venue is located
        neighborhood: String, // The specific neighborhood where the venue is located
        address: String // The actual full address, if available
    },
    metrics: {
        visited: {type: Number, default: 0}, // The tally of users who have tried this spot
        avgStars: Number, // The 1-5 average quality rating based on user feedback
        dollarSigns: Number // The 1-3 average price rating based on user feedback
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
});

SpotSchema.methods.addVisit = function(spot) {
  	this.visited += 1;
  	this.save(spot);
};

mongoose.model('Spot', SpotSchema);