let express = require('express');
let router = express.Router();
let waterfall = require('async-waterfall');
let User = require('../models/user');
let https = require('https');
let async = require('async');

let rand_token = require('rand-token');

const httpRequestOptions = {
    hostname: '',
    port: '',
    path: '',
    method: '',
    headers: {
        'Accept': 'application/json',
        'X-M2M-RI': '12345',
        'X-M2M-Origin': 'aei-jibcon',
        'Content-Type': 'application/json;ty=23'
    }
};

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.get('/asyncTaskTest',(req,res)=>{
    console.log('asyncTest request income');
    res.json("asyncTaskTest completed");
});


function facebookLogin(access_token, res) {
    let path = 'https://graph.facebook.com/me?access_token=' + access_token;
    //console.log('path : ', path);
    https.get(path, (response) => {
        response.on('data', (d) => {
            let json = JSON.parse(d);
            User.findOne({social_id: json.id}, (err, user) => {
                let foundUser;
                if (err) res.status(400).end();
                if (user === null) {
                    //signup
                    let path = `https://graph.facebook.com/${json.id}/?access_token=${access_token}&fields=email,picture,first_name,last_name`;
                    https.get(path, (response) => {
                        response.on('data', (d) => {
                            let json = JSON.parse(d);
                            let generated_token = rand_token.generate(48);
                            console.log('graph api data : ', json);
                            let newUser = new User({
                                email: json.email,
                                first_name: json.first_name,
                                last_name: json.last_name,
                                pic_url: json.picture.data.url,
                                token: generated_token,
                                social_id: json.id,
                                userinfo: {
                                    type: 'facebook',
                                    full_name: json.first_name + json.last_name,
                                    token: generated_token,
                                    pic_url: json.picture.data.url
                                },
                            });
                            console.log(json.picture.data.url);
                            newUser.save((err) => {
                                if (err) res.status(500);
                            });
                            foundUser = newUser;
                            res.status(200).json(foundUser);
                        });
                        //graph api
                    }).on('error', (e) => {
                        console.log(e);
                    });
                }
                else {
                    //login
                    foundUser = user;
                    res.status(200).json(foundUser);
                }
            });
        });
    }).on('error', (e) => {

        console.log(e);
        res.status(500).end();
    });
}

function samplelogin(access_token, res) {
    User.findOne({token: access_token}, (err, user) => {
        if (err) {
            throw err;
        }
    });
}

function kakaoLogin(access_token, res) {
    let httpRequestOptions = {
        host: 'kapi.kakao.com',
        port: '',
        path: '/v1/user/me',
        method: 'GET',

        headers: {
            Authorization: 'Bearer '
        }
    };
    httpRequestOptions.headers.Authorization += access_token;
    console.log(httpRequestOptions.headers.Authorization);
    let httpReq = https.request(httpRequestOptions, (response) => {
        response.on('data', (d) => {
            let foundUser;
            let json = JSON.parse(d);
            let generated_token = rand_token.generate(48);
            User.findOne({social_id: json.id}, (err, user) => {
                if (err) res.status(500).end();
                else if (user === null) {
                    let newUser = new User({
                        //fcm_token: '',
                        email: json.kaccount_email,
                        pic_url: json.properties.thumbnail_image,
                        token: generated_token,
                        social_id: json.id,
                        userinfo: {
                            type: 'kakao',
                            full_name: json.properties.nickname,
                            token: generated_token,
                            pic_url: json.properties.thumbnail_image
                        },
                    });

                    newUser.save((err) => {
                        if (err) res.status(500);
                    });
                    foundUser = newUser;
                    res.status(200).json(foundUser);
                } else {
                    //login
                    foundUser = user;
                    res.status(200).json(foundUser._doc);
                }
            });

        });
        response.on('end', () => {
            console.log('No more data in response.');
            //res.status(201).end();
        });
    });
    httpReq.on('error', (e) => {

        console.log(e);
        res.status(500).end();
    });
    httpReq.end();


}

router.post('/social_sign_up_or_in', (req, res) => {
    let access_token = req.body.token;
    let type = req.body.type;
    console.log('token : ', access_token);
    console.log('type : ', type);

    if (type === 'facebook') {

        facebookLogin(access_token, res);
    } else if (type === 'kakao') {
        kakaoLogin(access_token, res);

    } else if (type === 'naver') {

    }
});
router.post('/samples_sign_up', function (req, res) {

    let newUser = new User({
        email: req.body.email,

        first_name: req.body.first_name,
        last_name: req.body.last_name,
        token: req.body.token,
        user_id : "sample_user_id",
        userinfo: {
            type: 'sample',
            full_name: req.body.first_name + req.body.last_name,
            token: req.body.token,
            pic_url: req.body.pic_url
        }


    });
    newUser.save((err, output) => {
        if (err) {
            res.status(403).end();
            throw err;
        }
        res.status(200).json({
            output
        })
    })
});

router.get('/samples/sign_in', function (req, res) {
    let max = 1;
    let min = 1;
    let rand = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(rand);

    User.findOne({token: rand}, (err, user) => {
        if (err) {

            res.status(500).end();
            throw err;
        }
        if (user === null)
            res.status(500).end();
        else {
            res.status(200).json(
                user
            );
        }

    });

});


router.get('/allUsers', function (req, res) {
    // User.find((err, users) => {
    //     if (err) res.status(500);
    //     else
    //         res.json(users);
    // });
    User.find({})
        .populate('currentHouse')
        .exec((err,users)=>{
        if(err)
            throw err;
        res.status(201).json(users);
        });
});

//다른 기기로 로그인 할 경우 현재 기기의 fcm 토큰으로 업데이트
router.put('/updateUser/:token/:fcm_token', (req, res) => {
    User.findOne({token: req.params.token}, (err, user) => {
        if (err) res.status(404).end();
        else {
            user.fcm_token = req.params.fcm_token;
            user.save((err) => {
                res.status(201).json(user);

            });
        }
    });

});
router.delete('/deleteUser/:id', (req, res) => {
    console.log(req.params.id);

    User.remove({_id: req.params.id}, (err, ouput) => {
        if (err) {
            console.log('User remove error');
            res.status(500).end();
        }

        res.status(200).json({
            success: true
        });

    });

});
module.exports = router;

