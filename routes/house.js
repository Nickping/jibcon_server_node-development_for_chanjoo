let express = require('express');
let router = express.Router();
let House = require('../models/house');
let User = require('../models/user');
let DeviceItem = require('../models/DeviceItem');
router.post('/addHouse', (req, res) => {

    let newHouse;
    let promise1 = new Promise((resovle, reject) => {

        newHouse = new House({
            houseMaster: req.headers.authorization,
            houseName: req.body.houseName,
            houseType: req.body.houseType,
            houseAddress: req.body.houseAddress

        });
        newHouse.houseMember.push(req.headers.authorization);
        newHouse.save((err, newHouse) => {
            if (err) {
                reject('house save error');
                throw err;
            }
            resovle(newHouse);
        });
    });


    let promise2 = new Promise((resolve, reject) => {
        User.findOneAndUpdate({_id: req.headers.authorization},
            {currentHouse: newHouse},
            (err, user) => {
                if (err) {
                    reject('user update error');
                    throw err;
                }
                if (user === null)
                    reject('user find and update error');
                else
                    resolve(user);
            });
    });
    Promise.all([promise1, promise2])
        .then((values) => {
            let house = values[0];
            let user = values[1];
            res.status(201).json(house);
        })
        .catch((err) => {
            console.log(err);
            res.status(403).end();
        });

    res.status(201).json(newHouse);
});
router.delete('/deleteAllHouses', (req, res) => {
    House.remove({}, (err) => {
        if (err)
            throw err;
        res.end();
    });
});

router.get('/changeCurrentHouse/:newHouse', (req, res) => {

    let promise1 = new Promise((resolve, reject) => {
        House.findOne({_id: req.params.newHouse}, (err, newHouse) => {
            if (err)
                throw err;
            if (newHouse === null)
                reject('house not found');
            else
                resolve(newHouse);
        });
    });

    Promise.all([promise1])
        .then((values) => {
            User.findOneAndUpdate({_id: req.headers.authorization},
                {currentHouse: req.params.newHouse},
                (err, user) => {
                    if (err) {
                        throw err;
                    }
                    if (user === null)
                        res.status(403).end();
                    else
                        res.status(201).json(user);
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(403).end();
        });


});


//
// router.post('/changeCurrentHouse', (req, res) => {
//
//     let promise1 = new Promise((resolve, reject) => {
//
//         House.findOne({_id: req.body.house_id})
//             .populate('deviceList')
//             .exec((err, result) => {
//                 if (err) {
//                     throw err;
//                 }
//                 if (result === null) {
//                     reject('house not found');
//                 }
//                 else {
//                     resolve(result);
//                 }
//             });
//     });
//
//     let promise2 = new Promise((resolve, reject) => {
//         User.findOne({_id: req.body.user_id}, (err, house) => {
//             if (err)
//                 throw err;
//             if (house === null)
//                 reject('user not found');
//             else
//                 resolve(house);
//         });
//     });
//
//     Promise.all([promise1, promise2])
//         .then((values) => {
//                 let house = values[0];
//                 let user = values[1];
//                 let index, i;
//
//                 for (i = 0; i < house.houseMember.length; i++) {
//                     //house의 houseMember에 요청한 유저의 id 가 있는지 검사
//                     console.log('housemember i : ' + house.houseMember[i]);
//                     console.log(req.body.user_id);
//                     console.log(house.houseMember.length);
//
//                     if (house.houseMember[i] == req.body.user_id)
//                         break;
//                 }
//                 if (i === house.houseMember.length) {
//                     //없다면 그 집에대한 권한이 없으므로 종료
//                     console.log('no authorizaiton for this house')
//                     res.status(403).end();
//                 }
//                 else {
//                     //있다면 현재 집을 요청한 집으로 변경
//                     user.currentHouse = house._id;
//                     user.save((err) => {
//                         if (err)
//                             throw err;
//                     });
//                     console.log(user.currentHouse);
//                     res.status(201).json(house);
//                 }
//             }
//             , (err) => {
//                 console.log(err);
//                 res.status(403).end();
//             })
//         .catch((err) => {
//             if (err) {
//                 console.log(err);
//                 res.status(403).end();
//                 throw err;
//             }
//
//         });
//
// });

router.get('/allHouses', (req, res) => {
    House.find({}, (err, houses) => {
        if (err)
            throw err;
        res.status(201).json(houses);
    });
});

router.get('/getCurrentHouse', (req, res) => {
    House.findOne({_id: req.headers.authorization}, (err, house) => {
        if (err)
            throw err;
        if (house === null)
            res.status(403).end();
        else {
            res.status(201).json(house);
        }
    });
});


router.post('/getMyHouses', (req, res) => {
    //내가 등록된 집들의 목록 전부

    console.log(req.body);

    House.find({houseMember: {$in: [req.headers.authorization]}})
    // .populate('houseMaster')
    // .populate('houseMember')
        .populate('deviceList')
        .exec((err, houses) => {
            if (err)
                throw err;
            if (houses.length === 0)
                res.status(403).end();
            else
                res.status(201).json(houses);
        });
});

router.post('/addToMyHouse', (req, res) => {

});

router.delete('/deleteHouse', (req, res) => {
    //houseMaster가 집을 지우면 그에 연결된 모든 연결 삭제되야 함
    let promise1 = new Promise((resolve, reject) => {
        House.findOne({_id: req.body.house_id}, (err, house) => {
            if (err) {
                reject('house find err');
                throw err;
            }
            if (house === null)
                reject('house not found');
            else
                resolve(house);
        });
    });

    Promise.all([promise1])
        .then((values) => {
            let house = values[0];
            let devices = values[0].deviceList;
            let i = 0;
            for (i = 0; i < devices.length; i++) {
                DeviceItem.remove({_id: devices[i]}, (err) => {
                    if (err)
                        throw err;
                });

            }
            if (i == devices.length) {

                house.remove((err) => {
                    if (err)
                        throw err;
                    res.end();
                })
            }

        })
        .catch((err) => {
            if (err)
                throw err;

            res.status(201).end();
        });

});

module.exports = router;
