var mongoose = require('mongoose');
let timeDB = require('./timeDB');
mongoose.Promise = Promise;
var Schema = mongoose.Schema;
var taskSchema = new Schema({
    time_id: {type: Schema.Types.ObjectId, ref: 'timeDB'},
    userId: {type: String, required: true},
    task_type: {type: String},
    data: Object
});

module.exports = mongoose.model('task', taskSchema);

