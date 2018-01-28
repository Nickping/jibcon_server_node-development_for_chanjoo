let mongoose = require('mongoose');
let User = require('./user');
let House = require('./house');


mongoose.Promise = Promise;
let Schema = mongoose.Schema;
let invitationSchema = new Schema({
    house_id: {type: Schema.Types.ObjectId, ref: 'house'},
    user_id : {type:Schema.Types.ObjectId,ref:'user'},
    createdAt: {type:Date,default : Date.now()},
    validation : {type:Boolean,default : true}

});

module.exports = mongoose.model('invitation', invitationSchema);

