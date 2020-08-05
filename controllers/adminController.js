// Dependencies
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
var router = express.Router();


// Models
const Admin = require('../models/adminModel');
const Blog = require('../models/blogModel');
const Course = require('../models/courseModel');
const liveclass = require('../models/liveclass');
const user = require('../models/usersModel');
const Add_quiz = require('../models/Add_quiz');
const ans = require('../models/q&a')
// Modules
let today = require('../modules/dateModule');

var settings = require('../models/settings')
let createContent = require('../modules/createContent');
const auth = require('../modules/isverified');
const uploads3 = require('../modules/awsupload');
const { words, trim } = require('lodash');


//Function which check login part never open when you are already authenticated
const IsNotAuthenicated = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}


// Set Storage Engine Multer
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload Local 
const Upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, //1MB Max Size
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('blogImage');

const upload = multer({
    storage: storage,
})


// Check File Function
function checkFileType(file, cb) {
    // Allowed Extensions
    const filetypes = /jpeg|jpg|png|gif/
    // Check Ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check Mime Type
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true)
    } else {
        cb('Error: Images Only');
    }
}

// add-courses Upload Set Field
var videoContentUpload = uploads3.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'sectionFile' }])

// Routes
router
    .route('/dashboard')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            user.find({})
                .then((user) => {
                    Course.find({})
                        .then((course) => {
                            // console.log(course);

                            res.render("admin/dashboard", { user: user, course: course, layout: 'backend' });
                        })

                })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/add-quiz')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.find({})
                .then((title) => {
                    // console.log(title);
                    res.render('admin/add_quiz', { title: title, layout: 'backend' });
                })
            // console.log(req.admin);
        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res, next) => {
        console.log("hi");
        // console.log("course id "+ req.body.courseid );
        // Add_quiz It is a database model which is use to store question details 
        Add_quiz.create({
            courseid: req.body.courseid,
            // course_title: req.body.coursetitle,
            quiz_title: req.body.quiz_title,
            instructor_name: req.body.instructor_name,
            description: req.body.quiz_description,
        })
            .then((item) => {
                // console.log("id");
                let id = item._id;
                let addquestion = []
                for (var i = 0; i < req.body.question_array.length; i++) {
                    addquestion.push(
                        req.body.question_array[i]
                    )
                }
                Add_quiz.findByIdAndUpdate(id, { $push: { questions: addquestion } }, { new: true, useFindAndModify: false })
                    .exec((err, result) => {
                        if (err) {
                            return res.status(422).json({ error: err })
                        } else {
                            return res.json(result)

                        }
                    })
            })
    });



// Blog Route
router
    .route('/add-blog')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            console.log(req.admin);
            res.render('admin/add_blog', { layout: 'backend' });
        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res) => {
        Upload(req, res, (err) => {
            if (err) {
                res.render('admin/add_blog', { layout: 'backend', msg: err });
            } else {
                let tagStrings = (req.body.blogTags).trim().split(' ');
                let trueImagePath = (req.file.path).replace('public', '')
                const newblog = new Blog({
                    blogTitle: req.body.blogTitle,
                    blogAuthor: req.body.blogAuthor,
                    blogContent: req.body.blogContent,
                    blogPublishDate: today.getDate(),
                    blogImage: trueImagePath,
                    blogTags: tagStrings
                });
                newblog.save();
                console.log(newblog);
                res.redirect('/admin/dashboard');
            }
        })
    })

//Add Courses
router
    .route('/add-course')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            console.log(req.admin)
            res.render('admin/add_course', { layout: 'backend' })
        } else {
            res.redirect('/admin/login')
        }
    })
    .post(videoContentUpload, (req, res) => {

        // Get Only SectionFile Array
        let sectionFilesVideos = req.files.sectionFile;
        let videoLocationArr = [];
        // Get the URL of Video
        sectionFilesVideos.forEach((item) => {
            videoLocationArr.push(item.location);
        });

        // Sperate Each Lines from Preq and Outcome
        let splitline = (l) => {
            l = l.split(/1.|2.|3.|4.|5.|6.|7.|8.|9.|10|11.|12.|13.|14.|15.|16.|17.|18.|19.|20./);
            for (let i = 1; i <= l.length; i++) {
                if (l[i] != undefined) {
                    l[i] = l[i].trim()
                }
            }
            l = l.filter((word) => word.length > 1);
            return l
        }
        let outcome = splitline(req.body.outcome);
        let prereq = splitline(req.body.prereq);

        // Sort content in the form of objects     
        let content = createContent.contentSet(req.body.sectionName, req.body.sectionVideoText, videoLocationArr);

        const newCourse = new Course({
            creator_id: req.admin,
            title: req.body.title.trim(),
            instructor: req.body.instructor / trim(),
            price: req.body.price.trim(),
            discount: req.body.discount.trim(),
            category: req.body.category,
            level: req.body.level,
            language: req.body.language,
            prereq: prereq,
            outcome: outcome,
            description: req.body.description,
            thumbnail: req.files.thumbnail[0].location,
            createdAt: Date.now(),
            lastUpdatedAt: Date.now(),
            content: content
        })
        console.log(newCourse);
        newCourse.save();
        ans.create({
            courseId: newCourse.id
        })
            .then(() => {
                res.redirect('/admin/add-course')
            })
    })


// Approve Courses
router
    .route('/approve-course')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.find({ approved: false }, function (err, foundItem) {
                if (!err) {
                    if (foundItem) {
                        res.render('admin/approve_course', { layout: 'backend', course: foundItem });
                    }
                }
            })
        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res) => {
        let id = req.query.id;
        Course.findOneAndUpdate({ _id: id }, { $set: { approved: true, lastUpdatedAt: Date.now() } }, (err, doc) => {
            if (err) console.log(err);
            else {
                res.redirect('/admin/approve-course');
            }
        });
    })

// Signin And Signup
router
    .route('/')
    .get((req, res) => {
        res.redirect('/admin/login');
    })

router
    .route('/logout')
    .get((req, res) => {
        req.logout;
        // req.flash('success_msg','You are logged out')
        res.redirect('/admin/login');
        req.session.destroy();
    
    
    })

router
    .route('/login')
    .get(IsNotAuthenicated, (req, res) => {
        res.render('admin/login', { layout: 'backend', login: true });
    })
    .post((req, res) => {
        // console.log(req.body);
        passport.authenticate('local.admin')(req, res, function () {
            res.redirect('/admin/dashboard');
        });
    });

router
    .route('/register')
    .get((req, res) => {
        res.render('admin/register', { layout: 'backend', login: true });
    })
    .post((req, res) => {
        try {
            if (req.body.admin_code === process.env.ADMIN_CODE) {
                Admin.register({ username: req.body.username, email: req.body.email }, req.body.password, function (err, user) {
                    if (err) {
                        console.log(err);
                        res.redirect('/register');
                    } else {
                        passport.authenticate('local.admin')(req, res, function () {
                            console.log(req.admin);
                            res.redirect('/admin/dashboard');
                        });
                    }
                });
            } else {
                res.redirect('/admin/register');
            }
        } catch (e) {
            console.log(e);
        }
    });


router
    .route('/add-live-class')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.find({})
                .then((categorys) => {
                    res.render('admin/add_liveclass', { layout: 'backend', categorys: categorys });

                })
            // console.log(req.admin);
        } else {
            res.redirect('/admin/login');
        }
    })
    .post(upload.single('thumbnail'), (req, res) => {
        if (req.isAuthenticated()) {


            liveclass.create({
                title: req.body.title,
                category: req.body.category,
                level: req.body.level,
                language: req.body.language,
                date: req.body.date,
                time1: req.body.time1,
                time2: req.body.time2,
                prereq: req.body.prereq,
                description: req.body.description,
                thumbnail: req.file.filename,
            })


            // console.log(req.body);
            res.render('admin/dashboard', { layout: 'backend' });
        } else {
            res.redirect('/admin/login');
        }
    })

router
    .route('/user-profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Admin.findOne(req.user.id, (err, foundItems) => {
                if (!err) {
                    if (!foundItems) {
                        const newadminProfile = new Admin({

                            fullname: ' ',
                            state: ' ',
                            city: ' ',
                            postcode: ' ',
                            address: ' ',
                            phone: ' ',
                            companyname: ' ',
                            cto: ' ',
                        });
                        newadminProfile.save();
                        res.redirect('/admin/user-profile');
                    } else {
                        res.render('admin/admin_profile', {

                            fullname: foundItems.fullname,
                            state: foundItems.college,
                            phone: foundItems.phone,
                            address: foundItems.address,
                            postcode: foundItems.postcode,
                            city: foundItems.city,
                            companyname: foundItems.companyname,
                            cto: foundItems.cto,
                            layout: 'backend'
                        });
                    }
                }
            })
            // console.log(req.admin);

        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res) => {
        Admin.findOneAndUpdate(req.user.id,
            {
                $set:
                {
                    // image: req.file.filename,
                    fullname: req.body.fullname,
                    state: req.body.cllg,
                    phone: req.body.phone,
                    address: req.body.address,
                    postcode: req.body.postcode,
                    companyname: req.body.companyname,
                    cto: req.body.cto,
                    city: req.body.city,
                    // instagram: req.body.instagram
                }
            }, { new: true, useFindAndModify: false }, (err, d) => {
                if (err) console.log(err);
                else {
                    res.redirect('/admin/user-profile');
                };
            });
    })

router.post('/adminpassword', (req, res, next) => {
    Admin.findOne(req.user.id)
        .then((user) => {
            if (req.body.newPassword == req.body.confirmPassword) {
                user.changePassword(req.body.oldPassword, req.body.newPassword)
                    .then(() => {
                        res.redirect(req.get('referer'))
                        next()
                    })
            } else {
                req.toastr.error("passwords do not match")
                res.redirect('/admin/dashboard');
                next()
            }
        })
})


router
    .route('/google-recaptcha')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            // console.log(req.admin);
            res.render('admin/google_captcha', { layout: "backend" });
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/maintenance')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            // console.log(req.admin);
            res.render('admin/maintenance', { layout: "backend" });
        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res) => {

        if (req.body.enable == "on") {
            settings.findOneAndUpdate({ name: "studybee" }, { $set: { maintenance_title: req.body.maintenance_title, maintenance_description: req.body.maintenance_description, maintenance: "true" } })
                .then((settings) => {
                    res.render('admin/maintenance', { layout: 'backend' })
                })
        }
        else if (req.body.disable == "on") {
            settings.findOneAndUpdate({ name: "studybee" }, { $set: { maintenance: "false" } })
                .then((settings) => {
                    res.render('admin/maintenance', { layout: 'backend' })
                })
        }
        // Admin.findOneAndUpdate(req.user.id,
        //     {
        //         $set:
        //         {
        //             // image: req.file.filename,
        //             // instagram: req.body.instagram
        //         }
        //     },{ new: true, useFindAndModify: false }, (err, d) => {
        //         if (err) console.log(err);
        //         else {
        //             res.redirect('/admin/user-profile');
        //         };
        //     });
    })


router
    .route('/seo-tool')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            // console.log(req.admin);
            res.render('admin/seotools', { layout: "backend" });
        } else {
            res.redirect('/admin/login');
        }
    })


module.exports = router;

function newFunction() {
    return require('aws-sdk');
}
