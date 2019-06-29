var mongoose = require('mongoose');
 
const DuelSchema = new mongoose.Schema({
    challengerId : String,
    challengedId : String,
    duelDate : Date,
    activityId : String,
    winnerId : String
});
 
var Duel = mongoose.model("Duel", DuelSchema);
 
module.exports = Duel;