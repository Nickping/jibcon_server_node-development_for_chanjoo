var mongoose = require('mongoose');
mongoose.Promise = Promise;

var schema = mongoose.Schema({
    company_id : {type : String, require :true},
    product_name : {type :String, require :true},

});


module.exports = mongoose.model('product',schema);