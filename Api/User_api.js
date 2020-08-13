//Dependecies
const express = require('express');
var router = express.Router();
var async = require('async');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const multer=require('multer');

var rand, status;

//Models
const User = require('../models/usersModel');
const UserProfile = require('../models/userProfile');
const UserEnrolledCourses = require('../models/userEnrolledCourses');
const Course = require("../models/courseModel");
const Quiz = require("../models/Add_quiz");
const ans = require('../models/q&a')

// Modules
const smtpEmail = require('../modules/verifyEmail');
const passport = require('../modules/passport');

const IsNotAuthenicated = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}
var storage = multer.diskStorage({
    destination: process.cwd() + '/public/uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});
const upload = multer({
    storage: storage,
})
// Routes


router
    .route('/course')
    .get((req, res) => {
        let filter = req.query.filter;
        Course.find({}, function (err, foundItem) {
            if (!err) {
                if (foundItem) {
                    res.json(foundItem)
                }
            }
        })
    })
router
    .route('/:courseName/:id')
    .get((req, res) => {
        let courseName = req.params.courseName;
        let id = req.params.id;
        Course.findOne({ _id: id }, function (err, foundItem) {
            if (!err) {
                if (foundItem) {
                    let totalLectures = 0;
                    foundItem.content.forEach((item) => {
                        totalLectures = item.sectionVideoTitle.length + totalLectures;

                    })
                    // let totalVideoDuration = 0;
                    // foundItem.content.forEach((item) => {
                    //     item.sectionVideoUrl.forEach((videoUrl) => {
                    //         getVideoDurationInSeconds(videoUrl).then((duration) => {
                    //             console.log(duration);
                    //             totalVideoDuration = duration + totalVideoDuration;
                    //         })
                    //     })
                    // })
                    res.json({ course: foundItem, totalLectures: totalLectures });
                    // res.render('courses/course_details', { course: foundItem, totalLectures: totalLectures,layout:'main'});
                }
            }
        })
    })

// Signin-Signout Routes
router
    .route('/login')
    .post(
        (req, res) => {
            passport.authenticate('local')(req, res, function () {
                // console.log("hello user");
                // res.redirect('/user/dashboard');
                res.json(req.user);
            });
        }
    );
router
    .route('/register')
    .post((req, res) => {
        [rand, status] = smtpEmail.verifyEmail(req.get('host'), req.body.email);
        console.log(rand, status);
        User.register(
            {
                username: req.body.username,
                email: req.body.email,
                fullName: ' ',
                college: ' ',
                phone: ' ',
                address: ' ',
                postcode: ' ',
                linkedin: ' ',
                facebook: ' ',
                twitter: ' ',
                instagram: ' ',
                image: 'favicon.png',
                registerToken: rand
            },
            req.body.password, function (err, user) {
                if (err) {
                    console.log(err);
                    // res.redirect('/user/register');
                    res.json({msg:'somethingh wrong happen'})
                }
                else {

                    passport.authenticate('local')(req, res, function () {
                        // res.render('studeebee/login', { layout: 'main' });
                        res.json({msg:'You are registered. Please Login youself'})
                    });

                }
            })
    });
router
    .route('/dashboard')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            res.json(req.user[0]);
            // res.render('user/dashboard', { layout: 'main' });
        } else {
            // res.redirect('/user/login');
            res.json({ err: 'Error occured' })
        }
    });
    router
    .route('/profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            User.findById(req.user , (err, foundItems) => {
                if (!err) {                    
                        // res.render('user2/userProfile', {  
                        //     fullName: foundItems.fullName,
                        //     cllg: foundItems.college,
                        //     phone: foundItems.phone,
                        //     address: foundItems.address,
                        //     postcode: foundItems.postcode,
                        //     linkedin: foundItems.linkedin,
                        //     facebook: foundItems.facebook,
                        //     twitter: foundItems.twitter,
                        //     instagram: foundItems.instagram,
                        //     layout: 'user'
                        // }); 
                        res.json(foundItems);                   
                }
            })
        } else {
            // res.redirect('/user/login');
            res.json({msg:'Please Login'})
        }
    })
    .post(upload.single('image'),(req, res) => {
        User.findByIdAndUpdate(req.user,
            
                {   image:req.file.filename,
                    fullName: req.body.fullName,
                    college: req.body.cllg,
                    phone: req.body.phone,
                    address: req.body.address,
                    postcode: req.body.postcode,
                    linkedin: req.body.linkedin,
                    facebook: req.body.facebook,
                    twitter: req.body.twitter,
                    instagram: req.body.instagram
                }
            
            , (err, d) => {
                if (err) console.log(err);
                else {
                    // res.redirect('/user/profile');
                    res.json({msg:'profile data uploaded'})
                };
            });
    })
router
    .route('/logout')
    .get((req, res) => {
        req.logout;
        req.session.destroy();
        // res.redirect('/user/login');
        res.json({ msg: 'logout' });

    })


// Exporting router
module.exports = router;