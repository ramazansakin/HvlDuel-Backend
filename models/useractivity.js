var mongoose = require('mongoose');
 
const UserActivitySchema = new mongoose.Schema({
    userId: String,
    actId: String
});
 
var UserActivity = mongoose.model("UserActivity", UserActivitySchema);
 
module.exports = UserActivity;