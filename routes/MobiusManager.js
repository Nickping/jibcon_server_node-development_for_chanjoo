// var express = require('express');
// var router = express.Router();
// var mqtt = require('mqtt');
// var http = require('http');
// var xml2js = require('xml2js');
// var parser = new xml2js.Parser();
// var promise = require('promise');
// var FCM = require('fcm-push');
// var _ = require('underscore');
// var async = require('async');
// var serverKey = 'AAAA7Lx5bLQ:APA91bHMHOpGYBbCnK2kVZJtPv5erQKsnMIuaQJ6WLAxZvnrBdNR6l9jv1moTjumJq70jp9a5fL9ow5KKE_-D17eGCkBV_-HW9zLTnlmzVx48QUs49V9LJiOAqzdYHyCMH1r-8yTjdk0';
// var fcm = new FCM(serverKey);
// var pushMessage = {
//     to: '', // required fill with device token or topics
//     data: {
//         your_custom_data_key: ''
//     },
//     notification: {
//         title: 'Jibcon',
//         body: ''
//     }
// };
// /*cnt, sub, cin 나누기*/
// var mqttUrl = "mqtt://52.79.180.194";
//
//
// const subscriptionData = {
//     "m2m:sub": {
//         "rn": '',//subscription 이름이 됨
//         "enc": {
//             "net": [1, 3, 4]
//         },
//         "nu": [],
//         "nct": 2,
//         "pn": 1
//     }
// };
// const containerData = {
//     "m2m:cnt": {
//         "rn": ""
//     }
// }
// const httpRequestOptions = {
//     hostname: '52.79.180.194',
//     port: 7579,
//     path: '/Mobius',
//     method: 'POST',
//     headers: {
//         'Accept': 'application/json',
//         'X-M2M-RI': '12345',
//         'X-M2M-Origin': 'aei-jibcon',
//         'Content-Type': 'application/json;ty=23'
//     }
// }
//
//
// function mqttAddSubscription(subscribtionTopic, receiver) {
//     //mqtt topic 설정
//     var mqttClient = mqtt.connect(mqttUrl);
//     mqttClient.on('connect', () => {
//         console.log(subscribtionTopic);
//         mqttClient.subscribe(subscribtionTopic);
//         console.log('connect to ' + subscribtionTopic);
//     });
//     mqttClient.on('message', (topic, message) => {
//         if (topic == subscribtionTopic) {
//             console.log('message : ' + message);
//             var m2m = JSON.parse(message).pc.sgn.nev.rep;
//
//             if (m2m[`m2m:cin`] != null) {
//
//                 m2m = m2m[`m2m:cin`];
//                 console.log(m2m.con);
//                 pushMessage.to = receiver;
//                 pushMessage.notification.body = m2m.con;
//                 fcmMessageSending(pushMessage);
//             }
//         }
//
//     });
//
// }
//
//
// function fcmMessageSending(pushMessage) {
//
//     fcm.send(pushMessage, function (err, response) {
//         if (err) {
//             console.log("Something has gone wrong!");
//         } else {
//             console.log("Successfully sent with response: ", response);
//         }
//     });
// }
//
// router.post('/addCnt', (req, res) => {
//     //sensor에서 ae, rand_token_cnt-기기종류(cnt id), fcm-token 보냄
//     //fcm_token으로 유저 검색 후 해당 유저에 기기 추가하기.
//     //기기 추가 후 addSub 요청해야함
//     var option = JSON.parse(JSON.stringify(httpRequestOptions));
//     var cntData = JSON.parse(JSON.stringify(containerData));
//
//     option.path = httpRequestOptions.path + '/' + req.body.aeName;
//     option.headers[`Content-Type`] = "application/vnd.onem2m-res+json;ty=3";
//     cntData[`m2m:cnt`].rn = req.body.rn;
//
//     console.log(option);
//     console.log(cntData);
//     var httpReq = http.request(option, (httpRes) => {
//         console.log(`STATUS: ${httpRes.statusCode}`);
//         console.log(`HEADERS: ${JSON.stringify(httpRes.headers)}`);
//         httpRes.on('data', (chunk) => {
//             console.log(`BODY: ${chunk}`);
//
//         });
//         httpRes.on('end', () => {
//             console.log('No more data in response.');
//             res.status(201).end();
//
//             var userToken = req.headers.authorization.slice(6);
//             console.log(userToken);
//             var newDevice = new DeviceItem({
//                 user_id: userToken,
//                 //user를 Token으로 검색하고 _id로 검색후 저장
//                 deviceCom: req.body.deviceCom,
//                 deviceName: req.body.deviceName,
//                 deviceType: req.body.deviceType,
//                 deviceOnOffState: req.body.deviceOnOffState,
//                 subscribeOnOffState: req.body.subscribeOnOffState,
//                 roomName: req.body.roomName,
//                 aeName: req.body.aeName,
//                 cntName: req.body.cntName,
//                 contnet: req.body.content
//             });
//
//             newDevice.save((err) => {
//                 if (err) throw err;
//                 res.status(200).json({
//                     success: true
//                 })
//             });
//
//
//         });
//     });
//     httpReq.on('error', (e) => {
//         console.error(`problem with request: ${e.message}`);
//     });
//     httpReq.write(JSON.stringify(cntData));
//     httpReq.end();
// })
//
//
// router.post('/addSub', (req, res) => {
//
//     var option = JSON.parse(JSON.stringify(httpRequestOptions));
//     var subData = JSON.parse(JSON.stringify(subscriptionData));
//
//     option.path = httpRequestOptions.path + '/' + req.body.aeName + '/' + req.body.cntName;
//     subData[`m2m:sub`].rn = req.body.subName;
//     subData[`m2m:sub`].nu = [mqttUrl + '/' + req.body.subName];
//
//     var httpReq = http.request(option, (httpRes) => {
//
//         console.log(`STATUS: ${httpRes.statusCode}`);
//         console.log(`HEADERS: ${JSON.stringify(httpRes.headers)}`);
//         httpRes.on('data', (chunk) => {
//             console.log(`BODY: ${chunk}`);
//             //    todo addsubscription부터
//             mqttAddSubscription(req.body.topic, req.body.receiver);
//
//         });
//         httpRes.on('end', () => {
//             console.log('No more data in response.');
//             res.status(`${httpRes.statusCode}`).end();
//         });
//
//
//     });
//     httpReq.on('error', (e) => {
//         console.error(`problem with request: ${e.message}`);
//     });
//     httpReq.write(JSON.stringify(subData));
//     httpReq.end();
//
// });
//
//
// router.post('/deleteSub', (req, res) => {
//     var option = JSON.parse(JSON.stringify(httpRequestOptions));
//     option.path = option.path + '/' + req.body.aeName + '/' + req.body.cntName + '/' + req.body.subName;
//     option.method = 'DELETE';
//     var httpReq = http.request(option, (httpRes) => {
//
//         console.log(`STATUS: ${httpRes.statusCode}`);
//         console.log(`HEADERS: ${JSON.stringify(httpRes.headers)}`);
//         httpRes.on('data', (chunk) => {
//             console.log(`BODY: ${chunk}`);
//
//         });
//         httpRes.on('end', () => {
//             console.log('No more data in response.');
//             res.status(201).end();
//
//         });
//
//
//     });
//     httpReq.on('error', (e) => {
//         console.error(`problem with request: ${e.message}`);
//         res.status(500).end();
//     });
//
//     //httpReq.write(JSON.stringify(subData));
//     httpReq.end();
// });
//
//
// module.exports = router;