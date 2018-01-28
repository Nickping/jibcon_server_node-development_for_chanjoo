var mongoose = require('mongoose');
mongoose.Promise = Promise;

var schema = mongoose.Schema({
    name : {type :String, required : true},
});

module.exports = mongoose.model('company',schema);