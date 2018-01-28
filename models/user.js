var mongoose = require('mongoose');
mongoose.Promise = Promise;
var Schema = mongoose.Schema;
let House = require('../models/house');
var userSchema = new Schema({
    //token이 유저의 PK값
    email: {type: String, requried: true},
    first_name: {type: String, default: ''},
    last_name: {type: String, default: ''},
    fcm_token: {type: String, default: ''},
    token: {type: String, required: true},
    user_id: {type: String},
    social_id: {type: String},
    userinfo: {
        pic_url: {type: String},
        type: {type: String},
        token: {type: String},
        full_name: {type: String}
    },
    currentHouse: {type: Schema.Types.ObjectId,ref:'house'},

});

module.exports = mongoose.model('user', userSchema);