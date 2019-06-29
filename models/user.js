var mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    password: String,
    mail : String,
    token : String
});
 
var User = mongoose.model("User", userSchema);
 
module.exports = User;