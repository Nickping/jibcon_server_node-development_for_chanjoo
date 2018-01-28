let express = require('express');
let router = express.Router();
let House = require('../models/house');
let User = require('../models/user');
let Invitation = require('../models/invitation');

router.post('/makeInvitation', (req, res) => {
    let house_id = req.body.house_id;
    let user_id = req.body.user_id;
    let invitationUrl = "http://smarts.asuscomm.com:89/invitation/";
    let newInvitation = new Invitation({
        user_id: req.body.user_id,
        house_id: req.body.house_id,

    });
    
    newInvitation.save((err,result)=>{
        if(err)
            throw err;
        console.log(result._id);
        invitationUrl+=result._id;
        res.status(201).send(invitationUrl);
    });
});

router.get('/findInvitation/:invitation_Id',(req,res)=>{


    Invitation.findOne({_id:req.params.invitation_Id},(err,invitation)=>{
        if(err)
            throw err;
        let currentDate = new Date();
        let validationTime = invitation.createdAt;
        validationTime.setDate(validationTime.getDate()+2
        )
        if(validationTime<currentDate)
        {
            console.log('set false');
            invitation.validation = false;
        }
        else
        {
            console.log('set true');
            invitation.validation = true;
        }
        res.status(201).json(invitation);

    });
});

router.get('/allInvitations',(req,res)=>{
    Invitation.find({},(err,invitations)=>{
        if(err)
            throw err;
        res.status(201).json(invitations);
    });
});

router.delete('/allInvitations',(req,res)=>{
    Invitation.remove({},(err)=>{
        if(err)
            throw err;
        res.end();
    });
});

module.exports = router;
