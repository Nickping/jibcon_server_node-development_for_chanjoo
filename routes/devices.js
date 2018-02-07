let express = require('express');
let router = express.Router();
let User = require('../models/user');
let DeviceItem = require('../models/DeviceItem');
let House = require('../models/house');
//kill code never use ONLY FOR DEBUG
router.delete('/removeAllDevices', (req, res) => {
    DeviceItem.remove({}, (err, result) => {
        if (err) {
            console.log("removeAllDevices err");

        }
        res.status(201).end();
    });
});

router.post('/getDevices', (req, res) => {

    //let userToken = req.headers.authorization.substr(6, 0);
    //Token 1
    //현재 집에 등록된 디바이스 목록 가져오기
    //let userToken = req.headers.authorization.slice(6);

    House.findOne({_id: req.headers.authorization})
        .populate('deviceList')
        .exec((err, house) => {
            if (err) {
                throw err;
            }
            if (house === null) {
                res.status(403).end();
            }
            else {
                res.status(201).json(house.deviceList);
            }
        });
});


router.put('/devices/:id', (req, res) => {
    console.log('put devices');
    console.log(req.body);
    console.log('params : ' +
        req.body._id);
    // let userToken = req.headers.authorization.splice(6);
    //console.log('userToken : ' + userToken);
    DeviceItem.findOne({_id: req.body._id}, (err, device) => {
        //device = req.body;
        if (err) {
            console.log('error');
            res.status(403).end();
            throw err;
        }
        console.log('device : ' + device.toString());
        console.log("pass");
        device.user_id = req.body.user_id;
        device.deviceCom = req.body.deviceCom;
        device.deviceOnOffState = req.body.deviceOnOffState;
        device.subscribeOnOffState = req.body.subscribeOnOffState;
        device.houseName = req.body.houseName;
        device.data = req.body.data;

        device.save((err) => {
            if (err) res.status(500).end();
            else
                res.status(200).json({
                    success: true
                });
        });
    });
    //res.status(403).end();
});

router.get('/alldevices', (req, res) => {
    DeviceItem.find((err, devices) => {
        res.status(200).json(devices);
    });
});

router.delete('/deleteDevice/:id', (req, res) => {
    //let userToken = req.headers.authorization.slice(6);
    //Token 1
    //console.log(userToken);
    DeviceItem.remove({$and: [{user_id: req.headers.authorization}, {_id: req.params.id}]}, (err, output) => {
        if (err) res.status(501).end();
        else {
            res.status(201).json({
                success: true
            });
        }
    });
});


router.post('/addDevice', (req, res) => {

    //body로 house id가 있어야함. 추가하는 유저의 아이디도 있어야 함
    //추가하려는 유저가 house에 소속 되어있는지도 validation해야 함

    if (req.body === null) res.status(404).end();
    //let userToken = req.headers.authorization.slice(6);

    console.log('house_id' + req.headers.authorization);
    let promise1 = new Promise((resolve, reject) => {
        House.findOne({_id: req.headers.authorization}, (err, house) => {
            if (err)
                throw err;
            if (house === null) {
                res.status(403).end();
                reject('house not found');
            }
            else {
                resolve(house);
            }
        });
    });


    let promise2 = new Promise((resolve, reject) => {
        User.findOne({_id: req.body.user_id}, (err, user) => {
            if (err)
                throw err;
            if (user === null) {
                res.status(403).end();
                reject('user not found');
            }
            else {
                resolve(user);
            }
        });
    });

    Promise.all([promise1, promise2])
        .then((values) => {

            let house = values[0];
            let user = values[1];
            let newDevice = new DeviceItem({
                user_id: req.body.user_id,
                //user를 Token으로 검색하고 _id로 검색후 저장
                deviceCom: req.body.deviceCom,
                deviceName: req.body.deviceName,
                deviceOnOffState: req.body.deviceOnOffState,
                subscribeOnOffState: req.body.subscribeOnOffState,
                data: req.body.data

            });
            newDevice.save((err) => {
                if (err) throw err;

            });
            house.deviceList.push(newDevice._id);
            house.save((err, savedHouse) => {
                if (err)
                    throw err;
                res.status(201).json(savedHouse);
            });

        }, (err) => {
            console.log(err);
            res.status(403).end();
        });

});

module.exports = router;
