var mongoose = require('mongoose');
mongoose.Promise = Promise;
var Schema = mongoose.Schema;
var timerSchema = new Schema({
    time : {type:String, required : true},
});

module.exports = mongoose.model('timeDB', timerSchema);


