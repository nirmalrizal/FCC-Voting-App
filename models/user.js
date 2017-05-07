var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create User Schema
var User = new Schema({
  name: String,
  someID: String,
  votedPolls: Array,
  myPolls: Array
});


module.exports = mongoose.model('users', User);