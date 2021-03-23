//Dependecies
const express = require('express');
var router = express.Router();
const liveclass = require('../models/liveclass');
const passport = require('../modules/passport');
const multer=require('multer');

//Model
const Instructor = require('../models/instructor');
const InstructorProfile=require('../models/instructorprofile');

// Middleware
const smtpEmail = require('../modules/verifyEmail');

// Passport Init



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
//Instructor Dashboard
router.get('/', (req, res, next) => {
    liveclass.find({})
        .then((list) => {
            if (req.isAuthenticated()) {

                res.render('instructor/selectcourses', { liveclass: list, layout: 'instructor' });
            } else {
                res.redirect('/instructor/login');
            }
        });
});
//Profile edit
router
    .route('/profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            // console.log("helllo",req.user[0].id)
            Instructor.findById(req.user[0].id, (err, foundItems) => {
                // console.log("found items=",foundItems)
                if (!err) {
                    res.render('instructor/instructorProfile', {
                        
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
                        layout: 'instructor'
                    });
                    
                }
            })
        } else {
            res.redirect('/instructor/login');
        }
    })
    .post(upload.single('image'),(req, res) => {
        Instructor.findByIdAndUpdate(req.user,
            {       image:req.file.filename,
                    fullName: req.body.fullName,
                    phno: req.body.phno,
                    occupation:req.body.occupation,
                    companyname:req.body.companyname,
                    address: req.body.address,
                    postcode: req.body.postcode,
                    linkedin: req.body.linkedin,
                    facebook: req.body.facebook,
                    twitter: req.body.twitter,
                    instagram: req.body.instagram
            },
             (err, d) => {
                if (err) console.log(err);
                else {
                    // console.log(d)
                    res.redirect('/instructor/profile');
                };
            });
    })

router.get('/question-answer', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render('instructor/queans', { layout: 'instructor' });
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
        passport.authenticate('instructor-login')(req, res, function () {

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
        Instructor.register(
            { username: req.body.username,
                email: req.body.email,
                phno: req.body.phno,
                fullName: ' ',
                occupation:' ',
                companyname:' ',
                address: ' ',
                postcode: ' ',
                linkedin: ' ',
                facebook: ' ',
                twitter: ' ',
                instagram: ' ',
                image:'favicon.png',
                registerToken: rand 
            }, 
                req.body.password, function (err, user) {
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