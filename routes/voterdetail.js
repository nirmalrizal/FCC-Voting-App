var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PollSchema = new Schema({
	title: String,
	options: Array,
	owner: String
});

module.exports = mongoose.model('Poll',PollSchema);