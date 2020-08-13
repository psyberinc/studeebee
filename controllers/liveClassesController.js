const express = require('express');

var router = express.Router();

//Model
const Liveclass=require('../models/liveclass');

// Routes

router
    .route('/')
    .get((req, res) => {
        Liveclass.find({})
            .then((data) => {
                // console.log("data=",data);
                res.render('liveClasses/live_event', { layout: 'main',liveclass:data });

            })
        
    })

router
    .route('/live-class')
    .get((req, res) => {
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) {
            // console.log(req.user);

            res.render('user/dashboard', { layout: 'main' });
        } else {
            res.redirect('/user/login');
        }
    });
router
    .route('/live-class2')
    .get((req, res) => {
        // console.log(req.isAuthenticated());
        res.redirect('/live-classes/')
    });

router
    .route('/class-intro/:id')
    .get((req, res) => {
        if(req.isAuthenticated()){
            Liveclass.findById({_id:req.params.id})
            .then((data) => {
                // console.log("data=",data);
                res.render('liveClasses/class-intro', { layout: 'main',liveclass:data });

            })
            // res.render('liveClasses/class-intro', { layout: 'main' });
        }
        else{
           req.flash('error_msg','Please Enroll youself');
            res.redirect('/live-classes/')
        }
       
    })

module.exports = router;