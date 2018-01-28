var mongoose = require('mongoose');
mongoose.Promise = Promise;

var schema = mongoose.Schema({
    // user_id : {type : String, required : true},
    // deviceCom : {type : String, requied : true},
    // deviceName : {type : String, requied : true},
    // deviceType : {type : String, requied : true},
    // deviceOnOffState : {type : Boolean, required : true},
    // subscribeOnOffState : {type : Boolean, required : true},
    // roomName : {type : String,default:""},
    // aeName : {type : String,default:""},
    // cntName : {type : String,default:""},
    // content : {type : String,default:""},
    //
    user_id: {type: String, required: true},
    deviceCom: {type: String, requied: true},
    deviceName: {type: String, requied: true},
    deviceOnOffState: {type: Boolean, required: true},
    subscribeOnOffState: {type: Boolean, required: true},
    data: Object,

});


module.exports = mongoose.model('device',schema);