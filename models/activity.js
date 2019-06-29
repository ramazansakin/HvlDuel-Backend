var mongoose = require('mongoose');
 
const activitySchema = new mongoose.Schema({
    actname: String
});
 
var Activity = mongoose.model("Activity", activitySchema);
 
module.exports = Activity;