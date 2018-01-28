var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
var http = require('http');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var promise = require('promise');
var FCM = require('fcm-push');
var _ = require('underscore');
var async = require('async');
var serverKey = 'AAAA7Lx5bLQ:APA91bHMHOpGYBbCnK2kVZJtPv5erQKsnMIuaQJ6WLAxZvnrBdNR6l9jv1moTjumJq70jp9a5fL9ow5KKE_-D17eGCkBV_-HW9zLTnlmzVx48QUs49V9LJiOAqzdYHyCMH1r-8yTjdk0';
var fcm = new FCM(serverKey);
var pushMessage = {
    to: '', // required fill with device token or topics
    data: {
        your_custom_data_key: ''
    },
    notification: {
        title: 'Jibcon',
        body: ''
    }
};
/*cnt, sub, cin 나누기*/
var mqttUrl = "mqtt://52.79.180.194";


const subscriptionData = {
    "m2m:sub": {
        "rn": '',//subscription 이름이 됨
        "enc": {
            "net": [1, 3, 4]
        },
        "nu": [],
        "nct": 2,
        "pn": 1
    }
};
const containerData = {
    "m2m:cnt": {
        "rn": ""
    }
}
const httpRequestOptions = {
    hostname: '52.79.180.194',
    port: 7579,
    path: '/Mobius',
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'X-M2M-RI': '12345',
        'X-M2M-Origin': 'aei-jibcon',
        'Content-Type': 'application/json;ty=23'
    }
}


router.post('/addCnt', (req, res) => {
    //sensor에서 ae, rand_token_cnt-기기종류(cnt id), fcm-token 보냄
    //fcm_token으로 유저 검색 후 해당 유저에 기기 추가하기.
    //기기 추가 후 addSub 요청해야함
    //todo 센서가 Mobius로 등록, 센서는 등록한 정보를 node 서버로 전송. node는 받은 정보를 기반으로
    //todo Mobius에서 해당 cnt 검색 존재할 경우 센서로 부터 받은 정보를 기반으로 DeviceItem 모델에 등록 없을 경우 403





    // var option = JSON.parse(JSON.stringify(httpRequestOptions));
    // var cntData = JSON.parse(JSON.stringify(containerData));
    //
    // option.path = httpRequestOptions.path + '/' + req.body.aeName;
    // option.headers[`Content-Type`] = "application/vnd.onem2m-res+json;ty=3";
    // cntData[`m2m:cnt`].rn = req.body.rn;
    //
    // console.log(option);
    // console.log(cntData);
    // var httpReq = http.request(option, (httpRes) => {
    //     console.log(`STATUS: ${httpRes.statusCode}`);
    //     console.log(`HEADERS: ${JSON.stringify(httpRes.headers)}`);
    //     httpRes.on('data', (chunk) => {
    //         console.log(`BODY: ${chunk}`);
    //
    //     });
    //     httpRes.on('end', () => {
    //         console.log('No more data in response.');
    //         res.status(201).end();
    //
    //
    //
    //     });
    // });
    // httpReq.on('error', (e) => {
    //     console.error(`problem with request: ${e.message}`);
    // });
    // httpReq.write(JSON.stringify(cntData));
    // httpReq.end();
});


module.exports = router;