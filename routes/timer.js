let express = require('express');
let router = express.Router();
let timeDB = require('../models/timeDB');
let FCM = require('fcm-push');
let Task = require('../models/task');
let User = require('../models/user');
let serverkey = 'AAAA7Lx5bLQ:APA91bHMHOpGYBbCnK2kVZJtPv5erQKsnMIuaQJ6WLAxZvnrBdNR6l9jv1moTjumJq70jp9a5fL9ow5KKE_-D17eGCkBV_-HW9zLTnlmzVx48QUs49V9LJiOAqzdYHyCMH1r-8yTjdk0';
let fcm = new FCM(serverkey);
let cron = require('cron');
let axios = require('axios');
let instance = axios.create({
    baseURL: 'http://apis.skplanetx.com/gweather'
});
let appKey = '6f4249ae-dadf-3c5c-a4a1-25f1894c1b41';


let pushMessage = {
    to: '', // required fill with device token or topics
    data: {
        your_custom_data_key: ''
    },
    notification: {
        title: 'Jibcon',
        body: ''
    }
};

function fcmMessageSending(pushMessage) {

    fcm.send(pushMessage, function (err, response) {
        if (err) {
            console.log(err);
            console.log("Something has gone wrong!");
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
}

function sendMessage(task) {
    console.log(task);
    let message = JSON.parse(JSON.stringify(pushMessage));

    let promise1 = new Promise((resolve, reject) => {
        User.findOne({user_id: task.userId}, (err, user) => {
            if (err)
                throw err;
            if (user === undefined) {
                console.log('sendMessage user not found');
                return;

            }
            resolve(user.fcm_token);
        });
    });

    Promise.all([promise1])
        .then((result) => {
            console.log(result);
            message.to = result[0];
            message.notification.body = task.data.text;
            console.log(message);

            fcmMessageSending(message);
        }, (err) => {
            console.log(err);
        });

}

function sendWeather(task) {
    let message = JSON.parse(JSON.stringify(pushMessage));

    let promise1 = new Promise((resolve, reject) => {
        User.findOne({user_id: task.userId}, (err, user) => {
            if (err)
                throw err;
            if (user === undefined) {
                console.log('sendMessage user not found');
                return;

            }
            resolve(user.fcm_token);
        });
    });
    Promise.all([promise1])
        .then((result) => {
            instance.get('/current', {
                params: {
                    version: 1,
                    lat: task.data.lat,
                    lon: task.data.lon,
                    appKey: appKey
                }
            })
                .then((response) => {

                    console.log('success');
                    let current = response.data.gweather.current;
                    console.log(current[0].temperature);
                    //console.log(response.data.gweather.current);

                    message.to = result[0];
                    message.notification.body = '현재 온도는 ' + current[0].temperature.tc + ' 입니다';
                    console.log(message);
                    fcmMessageSending(message);

                })
                .catch((error) => {
                    console.log('error');
                    console.log(error);
                });
        });

}

router.post('/addTask', (req, res) => {
    let timeStamp = req.body.hour + '_' + req.body.minute;
    console.log(req.body.hour);
    //console.log(JSON.parse(req.body));
    let promise1 = new Promise((resolve, reject) => {
        timeDB.find({time: timeStamp}, (err, timeID) => {
            if (err) {
                reject('timeDB find error');
                throw err;

            }
            if (timeID.length === 0) {
                //timeDB 새로 생성
                let newTimeDB = new timeDB({
                    time: timeStamp
                });
                newTimeDB.save((err, newTime) => {
                    if (err) {
                        reject('newTimeDB save error');
                        throw err;

                    }
                    console.log('save success');
                    console.log(newTime);
                    resolve(newTime);
                });
            }
            else {
                console.log('already exist');
                resolve(timeID[0]);
            }
        });
    });

    Promise.all([promise1])
        .then((timeID) => {
            console.log('success');
            //태스크 새로 생성
            let newTask = new Task({
                time_id: timeID[0]._id,
                task_type: req.body.task_type,
                data: req.body.data,
                userId: req.body.userId

            });

            newTask.save((err, savedTask) => {
                if (err)
                    throw err;
                console.log(savedTask);

                res.status(201).end();
            });
        }, (err) => {

            console.log('task make failed');
            console.log(err);
            res.status(403).end();
        })
        .catch((err) => {
            console.log(err);
        });
});

router.put('/updateTask', (req, res) => {
    Task.findOne({_id: req.body._id}, (err, task) => {
        if (err) {
            console.log("update Task err");
            throw err;

        }
        if (task === null) {
            console.log("task not found");
            res.end();
        }
        else {
            console.log(task);
            task.hour = req.body.hour;
            task.minute = req.body.minute;
            task.type = req.body.type;
            task.data = req.body.data;

            task.save((err, savedTask) => {
                if (err)
                    throw err;
                if (savedTask === undefined) {
                    res.status(403).end();
                }
                else
                    res.status(201).json(savedTask);
            });

        }
    });
});

router.delete('/deleteTask', (req, res) => {

    Task.findOne({_id: req.headers.authorization}, (err, result) => {
        if (err)
            throw err;
        if (result === null) {
            console.log("deleteTask task not found");
            res.end();
        }
        else {
            console.log("result not null");
            result.remove((err) => {
                if (err)
                    throw err;
                else
                    res.status(201).end();
            });
        }
    });

});
router.post('/getMyTasks', (req, res) => {

    Task.find({userId: req.headers.authorization})
        .populate('time_id')
        .exec((err, tasks) => {
            if (err)
                throw err;
            if (tasks.length === 0) {
                console.log("task not found");
                res.end();
            }
            else {
                res.json(tasks);
            }

        });
});

/////////////DEBUG code
router.get('/allTimeDB', (req, res) => {
    timeDB.find({}, (err, timeDBs) => {
        if (err)
            throw err;
        res.status(201).json(timeDBs);
    });
});

router.get('/allTasks', (req, res) => {
    Task.find()
        .populate('time_id')
        .exec((err, tasks) => {
            if (err)
                throw err;
            if (tasks.length === 0) {
                console.log("task not found");
                res.end();
            }
            else {

                res.json(tasks);
            }

        });
});

router.delete('/deleteAllTasks', (req, res) => {
    Task.remove({}, (err, result) => {
        if (err)
            throw err;
        res.status(201).send({
            success: true
        })
    });
});


function timeController() {
    let currentTime = new Date();
    let hour = (currentTime.getHours() + 9) % 24;
    let minute = parseInt(currentTime.getMinutes());
    if (hour / 10 < 1) {
        hour = hour.toString();
        hour = '0' + hour;
        console.log(hour);
    }
    if (minute / 10 < 1) {
        minute = minute.toString();
        minute = '0' + minute;
    }

    let timeStamp = hour + '_' + minute;
    console.log('time Controller' + timeStamp);
    let promise1 = new Promise((resolve, reject) => {
        //현재 시간의 time_id 찾기
        //time_id를 가진 모든 태스크 찾기
        //현재 태스크의 태스크 타입으로 비교하여 해당하는 액션 수행

        timeDB.findOne({time: timeStamp}, (err, time_id) => {
            if (err)
                throw err;
            if (time_id === null) {
                reject('time_id not found');
            }
            else {
                resolve(time_id._id);
            }
        });

    });

    Promise.all([promise1])
        .then((time_id) => {

            Task.find({time_id: time_id[0]}, (err, tasks) => {
                if (err)
                    throw err;
                if (tasks.length === 0) {
                    console.log('task not found');
                }
                else {
                    console.log('해당 작업 수행');

                    let length = tasks.length;

                    for (let i = 0; i < length; i++) {
                        console.log(i + '번째 태스크');
                        console.log(tasks[i]);
                        switch (tasks[i].task_type) {
                            case 'message' :
                                console.log('send message');
                                sendMessage(tasks[i]);
                                break;
                            case 'weather' :
                                console.log('send weather');
                                sendWeather(tasks[i]);
                                break;
                        }
                    }

                }
            });
        }, (err) => {
            console.log(err)
        })
        .catch((err) => {
            console.log(err);
        });
}

let cronjob1 = new cron.CronJob('00 * * * * *', () => {
        timeController()
    }, () => {

    },
    true,
    'Asia/Seoul'
);


cronjob1.start();

module.exports = router;
