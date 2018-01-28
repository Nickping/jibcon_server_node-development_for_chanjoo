let mongoose = require('mongoose');
mongoose.Promise = Promise;
let Schema = mongoose.Schema;
let taskSchema = new Schema({
    data: Object,
    lat : {type:String},
    lon : {type: String},
    city :{type:String}
});
module.exports = mongoose.model('weatherTask', taskSchema);



//한시간 기준의 최신 서울 예보 정보가 data에 담김
//한시간에 한번씩 서울의 단기예보를 받아옴