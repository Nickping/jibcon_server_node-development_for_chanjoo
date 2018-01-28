let mongoose = require('mongoose');
let User = require('./user');
let device = require('./DeviceItem');
mongoose.Promise = Promise;
let Schema = mongoose.Schema;
let houseSchema = new Schema({
    houseMaster : {type: Schema.Types.ObjectId, ref : 'user', required : true},
    houseName : {type:String},
    houseType : {type:String},
    houseMember : [{type: Schema.Types.ObjectId, ref : 'user'}],
    deviceList : [{type:Schema.Types.ObjectId, ref : 'device'}],
    houseAddress : {type:String}

});
module.exports = mongoose.model('house', houseSchema);

