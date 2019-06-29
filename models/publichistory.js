var mongoose = require('mongoose');
 
const PublicHistorySchema = new mongoose.Schema({
    duelId: String
});
 
var PublicHistoryModel = mongoose.model("PublicHistoryModel", PublicHistorySchema);
 
module.exports = PublicHistoryModel;