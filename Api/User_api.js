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
// Routes for coureses
router
    .route('/free-course')
    .get((req, res) => {
        var arr=[];
       Course.find({}, function (err, foundItem) {
            if (!err) {
                for(var i=0;i<foundItem.length;i++){
                    if(foundItem[i].price ===0){
                        arr.push(foundItem[i])
                    
                    }
                }
                res.json({data: arr});
            }
        })
    })
router
    .route('/paid-course')
    .get((req, res) => {
        var arr=[];
       Course.find({}, function (err, foundItem) {
            if (!err) {
                for(var i=0;i<foundItem.length;i++){
                    if(foundItem[i].price >0){
                        arr.push(foundItem[i])
                    
                    }
                }
                res.json({data: arr});
            }
        })
    })
//To enroll courses
router
    .route('/enroll-course')
    .post((req, res) => {
        let course_id = req.body.courseId;
        let token = req.body.token
       // if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: token }, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newEnrolled = new UserEnrolledCourses({
                            user_id: token,
                            enrolled: []
                        })
                        newEnrolled.enrolled.push(course_id);
                        newEnrolled.save()

                        res.json({ msg: "Course added",enroll:newEnrolled });
                    } else if (foundItems) {
                        if (!foundItems.enrolled.includes(course_id)) {
                            foundItems.enrolled.push(course_id)
                            foundItems.save();
                        }

                        res.json({ msg: "Course added" });
                    }
                }
            })
        // } else {

            // res.json({ msg: "please Send correct token and courseid" });
        // }
    })
//To Show enrolled courses
router
    .route('/enrolled-courses')
    .post((req, res) => {
        token=req.body.token
        // if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: token }).populate('enrolled')
                .exec()
                .then((item) => {
                console.log(item)
                    // res.render('user2/courses', { course: item.enrolled, layout: 'user' });
                    res.json({data:item.enrolled})
                })
        // } else {
        //     // res.redirect('/user/login');
        //     res.json({msg:"please send valid token"})
        // }
    })
router
    .route('/wishlistshow-course')
    .post((req, res) => {
        token = req.body.token;
        // if (token === req.user[0].id) {
            UserEnrolledCourses.findOne({ user_id: token }).populate('wishlist')
                .exec()
                .then((item) => {
                    console.log(item);
                    // res.render('user2/wishlist', { layout: 'user', course: item.wishlist.reverse() });
                    res.json({ data: item.wishlist.reverse() })
                })
        // } else {
            // res.redirect('/user/login');
            // res.json({ msg: "Invalid token" });
        // }
    })
router
    .route('/wishlistadd-course')
    .post((req, res) => {
        let course_id = req.body.courseId;
        let token = req.body.token
       // if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: token }, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newEnrolled = new UserEnrolledCourses({
                            user_id: token,
                            wishlist: [],

                        })
                        newEnrolled.wishlist.push(course_id);
                        newEnrolled.save()
                        // res.redirect(`/courses/${course_name}/${course_id}`);
                        res.json({ msg: "added to wishlist" });
                    } else if (foundItems) {
                        if (!foundItems.wishlist.includes(course_id)) {
                            foundItems.wishlist.push(course_id)
                            foundItems.save();
                        }
                        // res.redirect(`/courses/${course_name}/${course_id}`);
                        res.json({ msg: "added to wishlist" });
                    }
                }
            })
      //  } else {
            // res.redirect('/user/login')
          //  res.json({ msg: "please Send correct token and courseid" });
        //}
    })
router
    .route('/wishlistremove-course')
    .post((req, res) => {
        let course_id = req.body.courseId;
        let token = req.body.token

        UserEnrolledCourses.findOneAndUpdate({ user_id: token }, { $pull: { wishlist: course_id } }, { new: true })
            .then((customer) => {
                res.json({ msg: "Course deleted from  wishlist" });
            })
    })
router
    .route('/trending-course')
    .get((req, res) => {
        
        Course.find().sort({createdAt:-1}).find( function (err, foundItem) {
            if (!err) {
                if (foundItem) {
                    res.json({ data: foundItem })
                }
            }
        })
    })
router
    .route('/course')
    .get((req, res) => {
        let filter = req.query.filter;
        Course.find({}, function (err, foundItem) {
            if (!err) {
                if (foundItem) {
                    res.json({data:foundItem})
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
                res.status(200).json(req.user);
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
                        res.status(200).json({msg:'You are registered. Please Login youself'})
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
    .route('/profiledetail')
    .post((req, res) => {
        // console.log(req.body.id);
        // if (!req.isAuthenticated()) {
        //     User.findById({ _id: req.body.id }, (err, foundItems) => {
        //         if (!err) {

        //             res.json(foundItems);
        //         }
        //     })
        // } else {
        //     res.json({ msg: 'Please Login' })
        // }
        User.findById({ _id: req.body.id })
        .then(data=>{
            res.json(data);
        })
    })
    router
    .route('/profile')
    .post((req, res) => {
        User.findByIdAndUpdate(req.body.id,
            
                {  
                    fullName: req.body.fullName,
                    college: req.body.college,
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