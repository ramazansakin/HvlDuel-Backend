var mongoose = require('mongoose');
 
const PersHistorySchema = new mongoose.Schema({
    userId: String,
    duelId: String
});
 
var PersHistory = mongoose.model("PersHistory", PersHistorySchema);
 
module.exports = PersHistory;