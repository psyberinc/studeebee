//Dependecies
const express = require('express');
var router = express.Router();
var async = require('async');
const multer = require('multer');
const nodemailer = require('nodemailer')
const crypto = require('crypto');
const flash=require('connect-flash')

var rand, status;

//Models
const Liveclass=require('../models/liveclass');
const User = require('../models/usersModel');
// const UserProfile = require('../models/userProfile');
const UserEnrolledCourses = require('../models/userEnrolledCourses');
const Course = require("../models/courseModel");
const Quiz = require("../models/Add_quiz");
const ans = require('../models/q&a')
const Blog = require('../models/blogModel');
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
// Google SignIn Route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/studeebee',
    passport.authenticate('google', { failureRedirect: '/user/login' }),
    function (req, res) {
        // Successful authentication, redirect dashboard.
        console.log(req.user);
        res.redirect('/user/dashboard');
    });
// Facebook SignIn Route
router.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

router.get('/auth/facebook/studeebee',
    passport.authenticate('facebook', { failureRedirect: '/user/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/user/dashboard');
    });
// Routes
router
    .route('/class-intro/:id')
    .get((req, res) => {
        if(req.isAuthenticated()){
            Liveclass.findById({_id:req.params.id})
            .then((data) => {
                // console.log("data=",data);
                res.render('user2/live', { layout: 'user',liveclass:data });

            })
            // res.render('liveClasses/class-intro', { layout: 'main' });
        }
        else{
           req.flash('error_msg','Please Enroll youself');
            res.redirect('/user/login')
        }
       
    })



router
.route('/dashboard')
.get((req, res) => {
    Course.find({}, (err, foundItem) => {
        if (!err && foundItem) {
            Blog.find({}, (err, foundBlog) => {
                if (!err && foundBlog) {
                    res.render('user2/dashboard', {layout:'user',
                        course: foundItem,
                        blog: foundBlog
                    });
                }
            })
        }
    })
})




router
    .route('/dashboard')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.find({})
               
                .then((item) => {
                    res.render('user2/dashboard', { course: item ,layout: 'user' });
                })
        } else {
            res.redirect('/user/login');
        }
    });
   



router
    .route('/courses')

    .get((req, res) => {
        if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: req.user }).populate('enrolled')
                .exec()
                .then((item) => {
                    res.render('user2/courses', { course: item.enrolled, layout: 'user' });
                })
        } else {
            res.redirect('/user/login');
        }
    })


    
router
    .route('/learn-course/:course_name/:course_id')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            let course_id = req.params.course_id;
            Course.findOne({ _id: course_id }, (err, foundItems) => {
                if (!err && foundItems) {
                    ans.findOne({ courseId: req.params.course_id })
                        .populate({
                            path: 'question',
                            populate: {
                                path: 'user',
                                model: "user"
                            }
                        })
                        .then((question) => {

                            res.render('user2/lecture', { list: question, course: foundItems, videoUrl: req.query.video, layout: 'blank' });
                        })
                }
            })
        } else {
            res.redirect('/user/login');
        }
    })
router
    .route("/learn-course/:course_id")
    .post((req, res) => {
        console.log("course id", req.params.course_id);
        console.log("data ", req.body);
        ans.findOneAndUpdate({ courseId: req.params.course_id }, { $push: { question: { title: req.body.title, description: req.body.description, user: req.user[0].id } } }, { new: true, useFindAndModify: false })
            .then(() => {
                res.redirect(req.get('referer'))
                // res.json(req.body)
            })
    })
router
    .route("/learn-course/:course_id/:questionNo")
    .post((req, res) => {
        ans.findOne({ courseId: req.params.course_id })
            .then((ans) => {
                var arr = {
                    name: req.body.name,
                    solution: req.body.answer_desc
                }
                ans.question[req.params.questionNo].answer.push(arr);
                ans.save();
                res.redirect(req.get('referer'))
            })
    })
router
    .route('/messages')
    .get((req, res) => {
        res.render('user2/messages', { layout: 'user' });
    })
router
    .route('/live-class')
    .get((req, res) => {
        Liveclass.find()
        .then(result=>{
            console.log(result);
            res.render('user2/live', { layout: 'user',liveclass:result });
        })
       
    })

    router
    .route('/wishlist/:course_id')
    .get((req, res) => {
        //console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            UserEnrolledCourses.findByIdAndUpdate(req.user.id, { $pull: { wishlist: req.params.course_id } }, { new: true })
                .then((course) => {
                    res.redirect(req.get('referer'));
                })
             //console.log(req.user);
        } else {
            res.redirect('/user2/login');
        }
    })

    router
    .route('/wishlistremove/:courseId')
    .get((req, res) => {
        let course_id = req.params.courseId;
        
        // console.log(course_id,req.params.id);
        // let token = req.body.token
        UserEnrolledCourses.findOneAndUpdate({ user_id: req.user[0].id }, { $pull: { wishlist: course_id } }, { new: true })
            .then((customer) => {
                // res.json({ msg: "Course deleted from  wishlist" });
                res.redirect(req.get('referer'));
            })
    })

router
    .route('/wishlist')
    .get((req, res) => {
        // console.log(req.user[0]);
        if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: req.user }).populate('wishlist')
                .exec()
                .then((item) => {
                    res.render('user2/wishlist', { layout: 'user', course: item.wishlist.reverse() });
                })
        } else {
            res.redirect('/user/login');
        }
    })
    .post((req, res) => {
        let course_id = req.query.id;
        let course_name = req.query.name;
        if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: req.user[0].id }, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newEnrolled = new UserEnrolledCourses({
                            user_id: req.user[0].id,
                            wishlist: [],
                        })
                        newEnrolled.wishlist.push(course_id);
                        newEnrolled.save()
                        res.redirect(`/courses/${course_name}/${course_id}`);
                    } else if (foundItems) {
                        if (!foundItems.wishlist.includes(course_id)) {
                            foundItems.wishlist.push(course_id)
                            foundItems.save();
                        }
                        res.redirect(`/courses/${course_name}/${course_id}`);
                    }
                }
            })
        } else {
            res.redirect('/user/login')
        }
    })
router
    .route('/enrolled')
    .post((req, res) => {
        let course_id = req.query.id;
        let course_name = req.query.name;
        if (req.isAuthenticated()) {
            UserEnrolledCourses.findOne({ user_id: req.user[0].id }, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newEnrolled = new UserEnrolledCourses({
                            user_id: req.user[0].id,
                            enrolled: []
                        })
                        newEnrolled.enrolled.push(course_id);
                        newEnrolled.save()
                        res.redirect(`/courses/${course_name}/${course_id}`);
                    } else if (foundItems) {
                        if (!foundItems.enrolled.includes(course_id)) {
                            foundItems.enrolled.push(course_id)
                            foundItems.save();
                        }
                        res.redirect(`/courses/${course_name}/${course_id}`);
                    }
                }
            })
        } else {
            res.redirect('/user/login')
        }
    })

router
    .route('/profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            User.findById(req.user[0].id, (err, foundItems) => {
                if (!err) {
                    res.render('user2/userProfile', {

                        fullName: foundItems.fullName,
                        cllg: foundItems.college,
                        phone: foundItems.phone,
                        address: foundItems.address,
                        postcode: foundItems.postcode,
                        linkedin: foundItems.linkedin,
                        facebook: foundItems.facebook,
                        twitter: foundItems.twitter,
                        instagram: foundItems.instagram,
                        layout: 'user'
                    });
                }
            })
        } else {
            res.redirect('/user/login');
        }
    })
    .post((req, res) => {
        User.findByIdAndUpdate(req.user[0].id,

            {
                fullName: req.body.fullName,
                college: req.body.cllg,
                phone: req.body.phone,
                address: req.body.address,
                postcode: req.body.postcode,
                linkedin: req.body.linkedin,
                facebook: req.body.facebook,
                twitter: req.body.twitter,
                instagram: req.body.instagram
            }, { new: true, useFindAndModify: false },
            (err, d) => {
                if (err) console.log(err);
                else {
                    res.redirect('/user/profile');
                };
            });
    })
router
    .route('/image-profile')
    .post(upload.single('image'), (req, res) => {
        User.findByIdAndUpdate(req.user[0].id,

            {
                image: req.file.filename,
            }

            , (err, d) => {
                if (err) console.log(err);
                else {
                    res.redirect('/user/profile');
                };
            });
    })

// Signin-Signout Routes
router
    .route('/login')
    .get(IsNotAuthenicated, (req, res) => {
        res.render('studeebee/login', { layout: "main", login: true  });
	    //res.status(403).json({message: 'Invalid username or password.'});
    })
    
            router.post('/login', passport.authenticate('local', {
                successRedirect : '/user/dashboard',
                failureRedirect : '/user/login',
                failureFlash : { type: 'error', message: 'Invalid username or password.' }
            }));

router
    .route('/loginlive')
    .post((req, res) => {
        passport.authenticate('local')(req, res, function () {
            res.redirect('/live-classes/live-class2');
        });
    })
router
    .route('/register')
    .get((req, res) => {
        res.render('studeebee/register', { layout: "main", login: true });
    })
    .post((req, res) => {
        [rand, status] = smtpEmail.verifyEmail(req.get('host'), req.body.email);
        // console.log(rand, status);
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
                    // console.log(err);
                    res.redirect('/user/register');
                }
                else {
                    passport.authenticate('local')(req, res, function () {
                        res.render('studeebee/login', { layout: 'main' });
                    });
                }
            })
    });
router
    .route('/logout')
    .get((req, res) => {
        req.logout;
        req.session.destroy();
        // req.flash('error', 'Logout successfully');
        res.redirect('/user/login');

    })
router
    .route('/verifyEmail')
    .get((req, res) => {
        res.send('Please Click the Link send to your Mail');
    });

router
    .route('/signin/verify')
    .get((req, res) => {
        let user_id = req.query.id;
        if (user_id == rand) {
            console.log(true);
            User.findOneAndUpdate({ registerToken: user_id }, { $set: { isVerified: true } }, (err, doc) => {
                if (err) console.log("Something wrong when updating data!");
                else {
                    res.redirect('/user/dashboard');
                }
            });
        } else {
            res.end('Error');
        }
    })

//Quiz Generation and certificate generation
router
    .route('/quiz-tim/:id')
    .get((req, res) => {
        // console.log(req.params.id)
        Quiz.findOne({ courseid: req.params.id })
            .then((quiz) => {
                if (quiz) {
                    res.render('courses/quiz', { layout: 'main', quiz: quiz });
                }
                else { res.send("quiz not found") }
            });
    });
router.post('/checkquiz/:id', (req, res) => {
    let answerarr = [];
    let correct = 0;
    let wrong = 0;
    let comingaswer = req.body.correct_values;
    Quiz.findOne({ courseid: req.params.id })
        .then((ak) => {
            if (ak) {
                // console.log("length is "+ak.questions.length);
                for (let i = 0; i < ak.questions.length; i++) {
                    answerarr.push(ak.questions[i].Answer);
                }
                for (let j = 0; j < comingaswer.length; j++) {
                    if (comingaswer[j] === answerarr[j]) {
                        correct = correct + 1;
                    }
                    else {
                        wrong = wrong + 1;
                    }
                }
            }
            return res.json({ correct, wrong });
        })
})

router.get('/certificate', (req, res) => {
    res.render('user2/certificate', { layout: 'user' });
})

router
    .route('/forget-password')
    .get((req, res) => {
        res.render('studeebee/forget-password', { layout: "backend", login: true });
    })

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect(req.get('referer'));
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'developer@psyber.co',
                    pass: 'Dev123#@!'
                }
            });
            var mailOptions = {
                to: req.body.email,
                from: 'developer@psyber.co',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/user/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success_msg', 'An e-mail has been sent to ' + req.body.email + ' with further instructions.');
                // console.log('done');
                 // done(err, 'done');
                res.redirect(req.get('referer'));
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.res.redirect(req.get('referer'));
    });
});
router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            // req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/user/forget-password');
        }
        res.render('studeebee/reset', {
            layout: "backend", login: true,
            user: user
        });
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    // req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('/user/login');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                //   res.json(req.body)
                user.save()
                    .then(() => {
                        var smtpTransport = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'parkorpetter107@gmail.com',
                                pass: '8864933491anas'
                            }
                        });
                        var mailOptions = {
                            to: user.email,
                            from: 'parkorpetter107@gmail.com',
                            subject: 'Your password has been changed',
                            text: 'Hello,\n\n' +
                                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                        };
                        smtpTransport.sendMail(mailOptions, function (err) {
                            //   req.flash('success', 'Success! Your password has been changed.');
                            //   done(err);

                            res.redirect('/user/login');
                        });
                    })

            });
        },

    ], function (err) {
        res.redirect('/');
    });
});
//Change password route
router.post('/changepassword', (req, res, next) => {
    User.findById(req.user[0].id)
        .then((user) => {
            if (req.body.newPassword === req.body.confirmPassword) {
                user.changePassword(req.body.oldPassword, req.body.newPassword)
                    .then(() => {
                        res.redirect(req.get('referer'))
                        next()
                    })
            } else {
                req.toastr.error("passwords do not match")
                res.redirect('/user/dashboard');
                next()
            }
        })
})
// Exporting router
module.exports = router;