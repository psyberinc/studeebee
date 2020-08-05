//Dependecies
const express = require('express');
var router = express.Router();
const liveclass = require('../models/liveclass');
const passport = require('../modules/passport');

//Model
const Instructor = require('../models/instructor');
const InstructorProfile=require('../models/instructorprofile');

// Middleware
const smtpEmail = require('../modules/verifyEmail');

// Passport Init
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user.id,user.username);
});
passport.deserializeUser(function (user, done) {
    done(null, user);
});

const IsNotAuthenicated = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}
//Instructor Dashboard
router.get('/', (req, res, next) => {
    liveclass.find({})
        .then((list) => {
            if (req.isAuthenticated()) {

                res.render('instructor/selectcourses', { list: list, layout: 'main' });
            } else {
                res.redirect('/instructor/login');
            }
        });
});


//Profile edit

// router.get('/profile', (req, res, next) => {
//     if (req.isAuthenticated()) {
//         res.render('instructor/instructorProfile', { layout: 'main' });
//     } else {
//         res.redirect('/instructor/login');
//     }
// })
router
    .route('/profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            InstructorProfile.findOne({ userId: req.user }, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newUserProfile = new InstructorProfile({
                            userId: req.user,
                            fullName: ' ',
                            phone: ' ',
                            occupation:' ',
                            companyname:' ',
                            address: ' ',
                            postcode: ' ',
                            linkedin: ' ',
                            facebook: ' ',
                            twitter: ' ',
                            instagram: ' ',
                        });
                        newUserProfile.save();
                        res.redirect('/instructor/profile');
                    } else {
                        res.render('instructor/instructorProfile', {
                            userId: foundItems.userId,
                            fullName: foundItems.fullName,
                            occupation:foundItems.occupation,
                            companyname:foundItems.companyname,
                            phone: foundItems.phone,
                            address: foundItems.address,
                            postcode: foundItems.postcode,
                            linkedin: foundItems.linkedin,
                            facebook: foundItems.facebook,
                            twitter: foundItems.twitter,
                            instagram: foundItems.instagram,
                            layout: 'main'
                        });
                    }
                }
            })
        } else {
            res.redirect('/instructor/login');
        }
    })
    .post((req, res) => {
        InstructorProfile.findOneAndUpdate({ userId: req.user },
            {
                $set:
                {
                    fullName: req.body.fullName,
                    phone: req.body.phone,
                    occupation:req.body.occupation,
                    companyname:req.body.companyname,
                    address: req.body.address,
                    postcode: req.body.postcode,
                    linkedin: req.body.linkedin,
                    facebook: req.body.facebook,
                    twitter: req.body.twitter,
                    instagram: req.body.instagram
                }
            }, (err, d) => {
                if (err) console.log(err);
                else {
                    // console.log(d)
                    res.redirect('/instructor/profile');
                };
            });
    })







router.get('/question-answer', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render('instructor/queans', { layout: 'main' });
    } else {
        res.redirect('/instructor/login');
    }


})

//Login/Register Router
router
    .route('/login')
    .get(IsNotAuthenicated, (req, res) => {
        res.render('instructor/login', { layout: "main", login: true });
    })
    .post((req, res) => {
        console.log("hello userdata ", req.body);
        console.log(res.data);
        console.log(res.body);
        passport.authenticate('instructor-login')(req, res, function () {
            console.log("hello user ", req.body);
            console.log(res.data);
            res.redirect('/instructor/');
        });

    })

router
    .route('/register')
    .get((req, res) => {
        res.render('instructor/register', { layout: "main" });
    })
    .post((req, res) => {
        // console.log(req.body);
        [rand, status] = smtpEmail.verifyEmail(req.get('host'), req.body.email);

        // console.log(rand, status);
        Instructor.register({ username: req.body.username, email: req.body.email, phno: req.body.phno, registerToken: rand }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.redirect('/instructor/register');
            } else {
                res.redirect('/instructor/login');
            }
        })

    })

router
    .route('/verifyEmail')
    .get((req, res) => {
        res.send('Please Click the Link send to your Mail');
    });

    router
    .route('/logout')
    .get((req, res) => {
        req.logout;
        req.session.destroy();
        res.redirect('/');
    })


// Exporting router
module.exports = router;