let express = require('express');
let router = express.Router();
let weatherDB = require('../models/weatherDB');
let serverkey = 'AAAA7Lx5bLQ:APA91bHMHOpGYBbCnK2kVZJtPv5erQKsnMIuaQJ6WLAxZvnrBdNR6l9jv1moTjumJq70jp9a5fL9ow5KKE_-D17eGCkBV_-HW9zLTnlmzVx48QUs49V9LJiOAqzdYHyCMH1r-8yTjdk0';
let cron = require('cron');
let axios = require('axios');
let instance = axios.create({
    baseURL: 'http://apis.skplanetx.com/gweather'
});
let appKey = '6f4249ae-dadf-3c5c-a4a1-25f1894c1b41';

/*
CRUD

도시이름으로 날씨를 검색함(도시별
DB에서 그 도시에 해당하는 날씨가 있는지 먼저 검색

C : 사용자가 새로운 도시를 요청함
DB에 그 도시가 없을 경우
요청한 lat, lon에 해당하는 중기 예보를 검색해서 새로운 DB로 추가, 맨앞 요소 돌려준 후 Retrieve 수행

R : 사용자가 다시 킴
Device Fragment
DB에서 그 도시에 해당하는 날씨 data를 가져옴
data의 맨 앞 배열 요소를 돌려줌

중기예보
DB에서 그 도시에 해당하는 날씨 data를 가져옴
data에서 5개 배열에 해당하는 요소를 돌려줌
Sunset, sunrise 도같이 돌려줌

U : 1시간에 한번씩
DB 업데이트

D : 아마 없을듯

*/
function updateWeatherDB() {
    console.log('updateWeatherDB ');
    let promise1 = new Promise((resolve, reject) => {
        weatherDB.find({}, (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result.length === 0)
                reject('No weather item to update');
            console.log(result.length+' city\'s weather information update is now processing');
            resolve(result);
        });
    });

    Promise.all([promise1])
        .then((values) => {
            let weatherDatas = values[0];
            for (let i = 0; i < weatherDatas.length; i++) {
                console.log(weatherDatas[i].city + ' now processing');
                instance.get('/forecast/short', {
                    params: {
                        lat: weatherDatas[i].lat,
                        lon: weatherDatas[i].lon,
                        appKey: appKey,
                        version: 1
                    }
                })
                    .then((response) => {
                        let weatherData = response.data.gweather.forecastDays[0];
                        //console.log(weatherData.forecast);
                        weatherDB.update({_id: weatherDatas[i]._id}, {$set: {data: weatherData.forecast}}, (err, result) => {
                            if (err) {
                                console.log('update for ' + weatherDatas[i].city + ' failed');
                                console.log(err);
                            }
                            else {
                                console.log(result);
                                console.log('update for ' + weatherDatas[i].city + ' finished');
                            }
                        });

                    })
                    .catch((err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
            }
        })
        .catch((err) => {
            console.log(err);
        });


}


function DEBUG() {
    weatherDB.remove({}, (err, result) => {
        if (err) {
            console.log(err);
            throw err;
        } else
            console.log('DEBUG code finished');

    });

}

router.post('/getCurrentWeaterInfo', (req, res) => {
    //메인 화면에서 날씨 가져오기
    console.log('getCurrentWeaterInfo');
    let promise1 = new Promise((resolve, reject) => {

        weatherDB.find({city: req.body.city}, (err, result) => {
            if (err) {
                console.log(err);
                res.status(403).end();
            }
            if (result.length === 0) {
                console.log('weather data for ' + req.body.city + 'not found');
                //현재 도시 날씨 가져와서 저장
                reject(req.body);//새로 날씨 가져와서 저장
            } else {
                //해당 도시 날씨 리턴
                console.log('weather data for '+ req.body.city + ' found');
                resolve(result[0]);
            }
        });
    });

    Promise.all([promise1])
        .then((values) => {
            //찾은 날씨 클라이언트로 돌려주기
            console.log(values[0]);
            res.json(values[0]);
        })
        .catch((values) => {
                //새로운 날씨 가져와서 저장 후 다시 돌려주기
                instance.get('/forecast/short', {
                    params: {
                        version: 1,
                        lat: values.lat,
                        lon: values.lon,
                        appKey: appKey
                    }
                })
                    .then((response) => {
                        let weatherData = response.data.gweather.forecastDays[0];
                        //console.log(response.data.gweather.forecastDays[0]);
                        let newWeatherData = weatherDB({
                            city: weatherData.location.city,
                            data: weatherData.forecast,
                            lat: values.lat,
                            lon: values.lon
                        });
                        //console.log(newWeatherData.city);
                        //console.log(newWeatherData);
                        newWeatherData.save((err, result) => {
                            if (err) {
                                console.log(err);
                                res.json('data save failed');
                            } else
                                res.json(result);

                        });
                    })
                    .catch((error) => {
                        console.log('error');
                        console.log(error);
                    });
            }
        )
});


let cronjob2 = new cron.CronJob('00 00 * * * *', () => {
        //todo 1분에 한번씩 업데이트 중인데 1시간에 한번씩 업데이트하도록 변경
        updateWeatherDB();
    }, () => {

    },
    true,
    'Asia/Seoul');
cronjob2.start();
//DEBUG();
module.exports = router;
