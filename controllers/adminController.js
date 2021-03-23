// Dependencies
require('dotenv').config();
const express = require('express');
const passport = require('passport');
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
const Instructor = require('../models/instructor');
const Category = require('../models/category');


// Modules
let today = require('../modules/dateModule');
var settings = require('../models/settings')
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

function convert_vimeo(input) {
    var pattern = /(?:http?s?:\/\/)?(?:www\.)?(?:vimeo\.com)\/?(\S+)/g
    if (pattern.test(input)) {
        var replacement = 'https://player.vimeo.com/video/$1'
        var input = input.replace(pattern, replacement);
    }
    return input;
}

function convert_youtube(input) {
    var pattern = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(\S+)/g;
    if (pattern.test(input)) {
        var replacement = "http://www.youtube.com/embed/$1"
        var input = input.replace(pattern, replacement);
        // For start time, turn get param & into ?
        var input = input.replace('&amp;t=', '?t=');
    }
    return input;
}
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
                .then((student) => {
                    Course.find({})
                        .then((course) => {
                            Blog.find({})
                              .then((blog) => {
                                Instructor.find({})
                                 .then((instructor) => {
                            // console.log(course);

                            res.render("admin/dashboard", { student: student, course: course,blog:blog,instructor:instructor, layout: 'backend' });
                        })

                })
            })
        })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/display_users')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            user.find({})
                .then((student) => {

                    // console.log(course);

                    res.render("admin/users", { student: student, layout: 'backend' });


                })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
    // router
    // .route('/blog-list')
    // .get((req, res) => {
    //     if (req.isAuthenticated()) {

    //         res.render('admin/blog_list', { layout: 'backend' });
    //     } else {
    //         res.redirect('/admin/login');
    //     }
    // });
    router
    .route('/blog-list')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            Blog.find({})
                .then((result) => {
                               
                    console.log( "data",result);

                    res.render("admin/blog_list", { student:result, layout: 'backend' });


                })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    });
    
    router
    .route('/view_user/:id')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            // console.log("haa ",req.params.id,req.params.name)
            user.findById(req.params.id)
                .then(result => {
                   // console.log(result);
                    res.render('admin/view_user', { layout: 'backend', student:result })
                })
        
        } else {
            res.redirect('/admin/login')
        }
    })

    router
    .route('/view_instructor/:id')
    .get((req, res) => {

        if (req.isAuthenticated()) {
             console.log("haa ",req.params.id,req.params.name)
            Instructor.findById(req.params.id)
                .then(result => {
                   // console.log(result);
                    res.render('admin/view_instructor', { layout: 'backend', student:result })
                })
        
        } else {
            res.redirect('/admin/login')
        }
    })



router
    .route('/display_instructors')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            Instructor.find()
                .then((student) => {
                    res.render("admin/instructor", { student: student, layout: 'backend' });
                })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/delete_user/:id')
    .get((req, res) => {
        //console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            user.findByIdAndRemove(req.params.id)
                .then((student) => {
                    res.redirect('/admin/display_users')
                })
             //console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
    router
    .route('/delete_blog/:id')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            Blog.findByIdAndRemove(req.params.id)
                .then((student) => {
                    res.redirect('/admin/blog-list')
                })
            // console.log(req.user);
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/delete_instructors/:id')
    .get((req, res) => {
        // console.log("dashboard " + req.user[0].username);
        if (req.isAuthenticated()) {
            Instructor.findByIdAndRemove(req.params.id)
                .then((student) => {
                    res.redirect('/admin/display_instructors')
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
        // console.log("hi");
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
                        console.log(result);
                    })
            })
    });



// Blog Route
router
    .route('/add-blog')
    .get((req, res) => {
        if (req.isAuthenticated()) {

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
                // console.log(newblog);
                res.redirect('/admin/dashboard');
            }
        })
    })

    router
    .route('/add-category')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Category.find()
                .then(result => {
                   
                    res.render('admin/course/add_category', { layout: 'backend', course: result })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
      
      router.post('/add-category',  function (req, res, next) {
        // var filepath=req.file.filename
        // console.log(req.body.cname)
        Category.create({
        category: req.body.cname
          
        })
          .then((Category) => {
              console.log('category')
            res.redirect('/admin/add-category');
          })
      });
      








//Add Courses
router
    .route('/course')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.find()
                .then(result => {

                    res.render('admin/course/course', { layout: 'backend', course: result })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
router
    .route('/course-module/:id')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.findOne({ _id: req.params.id })
                .then(result => {
                    // console.log('id',  result.content[0].id);
                    if (result.content.length === 0) {
                        // req.flash('error_msg', 'No Module Found');
                        // res.redirect('/admin/course');
                        res.render('admin/course/course-module', { layout: 'backend', course: 0,courseid: result.id })
                       
                    }
                    else {
                        res.render('admin/course/course-module', { layout: 'backend', course: result.content, courseid: result.id })
                    }

                })

        } else {
            res.redirect('/admin/login')
        }
    })
router
    .route('/add-course-module/:id')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            // Course.find()
            // .then(result=>{

            res.render('admin/course/add-course-module', { layout: 'backend', courseid: req.params.id })
            // })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post((req, res) => {
        Course.findByIdAndUpdate(req.params.id,
            {
                $push: {
                    content: {
                        created_At: Date.now(),
                        module_description: req.body.description,
                        additional_link: req.body.additional_link,
                        sectionTitle: req.body.title,
                    }
                }
            }
            , (err, foundItems) => {
                //     if (!err) {
                if (foundItems) {
                    //            console.log(content1)
                    //                 foundItems.content.push(content1)
                    //                 foundItems.save();

                    res.redirect(`/admin/course-module/${req.params.id}`);
                    //         }
                }
            })
    })
router
    .route('/edit-course-module/:id/:index')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            // console.log("haa ",req.params.id,req.params.name)
            Course.findById(req.params.id)
                .then(result => {
                    res.render('admin/course/edit-course-module', { layout: 'backend', courseid: req.params.id, content: result.content[req.params.index], index: req.params.index })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post((req, res) => {
        Course.findByIdAndUpdate({ _id: req.params.id })
            .then(result => {
                result.content[req.params.index].$set({
                    module_description: req.body.description,
                    additional_link: req.body.additional_link,
                    sectionTitle: req.body.title,

                })
                result.save();
                res.redirect('/admin/course/')
            })

    })


    router
    .route('/edit_blog/:id')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            // console.log("haa ",req.params.id,req.params.name)
            Blog.findById(req.params.id)
                .then(result => {
                    res.render('admin/edit_blog', { layout: 'backend', student:result })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post(upload.single('blogImage'),(req, res) => {
        let tagStrings = (req.body.blogTags).trim().split(' ');
         let trueImagePath = (req.file.path).replace('public', '')
         console.log(req.body);
        Blog.findByIdAndUpdate({ _id: req.params.id },
            {
                blogTitle: req.body.blogTitle,
                blogAuthor: req.body.blogAuthor,
                blogContent: req.body.blogContent,
               
                blogImage: trueImagePath,
                blogTags: tagStrings
            } ) 
                res.redirect('/admin/blog-list')
     

    })



router
    .route('/delete-course-module/:id/:index')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            // console.log("haa ",req.params.id,req.params.name)
            Course.findById(req.params.id)
                .then(result => {
                    // console.log(result.content[req.params.index]);
                    result.content[req.params.index].remove();
                    result.save()
                    res.redirect(`/admin/course-module/${req.params.id}`);
                    // result.content[req.params.index].
                    // res.render('admin/course/edit-course-module', { layout: 'backend',courseid:req.params.id,content:result.content[req.params.index],index:req.params.index})
                })

        } else {
            res.redirect('/admin/login')
        }
    })
router
    .route('/view-module-videos/:id/:index')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    res.render('admin/course/view-module-videos', { layout: 'backend', courseid: req.params.id, course: result.content[req.params.index], index: req.params.index })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
router
    .route('/add-course-video/:id/:index')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    // console.log(result.content)
                    res.render('admin/course/add-course-video', { layout: 'backend', course: result.content, courseid: req.params.id, index: req.params.index })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post((req, res) => {
        if (req.isAuthenticated()) {
            var videolink
            Course.findById(req.params.id)
                .then(result => {
                    if (req.body.category === 'Vimeo') {
                        videolink = convert_vimeo(req.body.video_link)
                    }
                    else if (req.body.category === 'Youtube') {
                        videolink = convert_youtube(req.body.video_link)
                    }
                    else {
                        videolink = req.body.video_link
                    }
                    result.content[req.params.index].sectionVideoTitle.push(req.body.title)
                    result.content[req.params.index].sectionVideoUrl.push(videolink)
                    result.content[req.params.index].videoDuration.push(req.body.duration)
                    result.save()
                    res.redirect(`/admin/course-module/${req.params.id}`);
                })

        } else {
            res.redirect('/admin/login')
        }

    })
router
    .route('/edit-module-video/:id/:moduleindex/:videoindex')
    .get((req, res) => {
        var moduleindex = req.params.moduleindex
        var videoindex = req.params.videoindex
        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    // var videotitle=result.content[moduleindex].sectionVideoTitle[videoindex]
                    // var videourl=result.content[moduleindex].sectionVideoUrl[videoindex]
                    // var videodurn=result.content[moduleindex].videoDuration[videoindex]
                    // console.log("moduleindex",moduleindex,"videoindex=",videoindex)
                    // console.log(result.content[moduleindex].sectionVideoTitle[videoindex])
                    res.render('admin/course/edit-module-video',
                        { layout: 'backend', course: result.content, courseid: req.params.id, moduleindex: moduleindex, videoindex: videoindex })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post((req, res) => {
        var moduleindex = req.params.moduleindex
        var videoindex = req.params.videoindex
        var index
        var videolink
        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    index = result.content[moduleindex].sectionVideoTitle.indexOf(result.content[moduleindex].sectionVideoTitle[videoindex])
                    if (req.body.category === 'Vimeo') {
                        if (req.body.video_link.startsWith("https://player.vimeo.com")) {
                            videolink = req.body.video_link
                        } else {
                            videolink = convert_vimeo(req.body.video_link)
                        }


                    }
                    else if (req.body.category === 'Youtube') {
                        if (req.body.video_link.startsWith("https://www.youtube.com/embed")) {
                            videolink = req.body.video_link
                        } else {
                            videolink = convert_youtube(req.body.video_link)
                        }

                    }
                    else {
                        videolink = req.body.video_link
                    }
                    result.content[moduleindex].sectionVideoTitle.splice(index, 1, req.body.title)
                    result.content[moduleindex].sectionVideoUrl.splice(index, 1, videolink)
                    result.content[moduleindex].videoDuration.splice(index, 1, req.body.duration)

                    result.save()
                    res.redirect(`/admin/course-module/${req.params.id}`);
                })

        } else {
            res.redirect('/admin/login')
        }

    })
router
    .route('/delete-module-video/:id/:moduleindex/:videoindex')
    .get((req, res) => {
        var index
        var moduleindex = req.params.moduleindex
        var videoindex = req.params.videoindex
        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    index = result.content[moduleindex].sectionVideoTitle.indexOf(result.content[moduleindex].sectionVideoTitle[videoindex])
                    result.content[moduleindex].sectionVideoTitle.splice(index, 1)
                    result.content[moduleindex].sectionVideoUrl.splice(index, 1)
                    result.content[moduleindex].videoDuration.splice(index, 1)
                    result.save()
                    res.render('admin/course/view-module-videos', { layout: 'backend', courseid: req.params.id, course: result.content[req.params.moduleindex], index: req.params.moduleindex })
                })

        } else {
            res.redirect('/admin/login')
        }
    })

router
    .route('/add-course')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            Category.find()
            .then(result=>{
                res.render('admin/course/add_course', { layout: 'backend',course:result })
            })
          
            
        } else {
            res.redirect('/admin/login')
        }
    })
    .post(upload.single('thumbnail'), (req, res) => {

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
        var outcome = splitline(req.body.outcome);
        var prereq = splitline(req.body.prereq);

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
            thumbnail: req.file.filename,
            createdAt: Date.now(),
            lastUpdatedAt: Date.now(),

        })
        // console.log(newCourse);
        newCourse.save();
        ans.create({
            courseId: newCourse.id
        })
            .then(() => {
                res.redirect('/admin/add-course')
            })
    })
router
    .route('/edit-course/:id')
    .get((req, res) => {

        if (req.isAuthenticated()) {
            Course.findById(req.params.id)
                .then(result => {
                    console.log(result)
                    res.render('admin/course/edit_course', { layout: 'backend', course: result })
                })

        } else {
            res.redirect('/admin/login')
        }
    })
    .post(upload.single('thumbnail'), (req, res) => {
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
        var outcome = splitline(req.body.outcome);
        var prereq = splitline(req.body.prereq);
        Course.findByIdAndUpdate(req.params.id, {

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
            thumbnail: req.file.filename,
            lastUpdatedAt: Date.now(),
        })
        res.redirect('/admin/course')
    })
router
    .route('/delete-course/:id')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Course.findByIdAndRemove(req.params.id).then(() => { res.redirect("/admin/course") })
        } else {
            res.redirect('/admin/login');
        }
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
    router.post('/login', passport.authenticate('local', {
        successRedirect : '/admin/dashboard',
        failureRedirect : '/admin/login',
        failureFlash : { type: 'error', message: 'Invalid username or password.' }
    }));


router
    .route('/register')
    .get((req, res) => {
        res.render('admin/register', { layout: 'backend', login: true });
    })
    .post((req, res) => {
        try {
            if (req.body.admin_code === process.env.ADMIN_CODE) {
                Admin.register({
                    username: req.body.username,
                    email: req.body.email,
                    fullname: " ",
                    state: " ",
                    phone: " ",
                    address: " ",
                    postcode: " ",
                    city: " ",
                    companyname: " ",
                    cto: " ",
                    image: "favicon.png"

                }, req.body.password, function (err, user) {
                    if (err) {
                        // console.log(err);
                        res.redirect('/admin/register');
                    } else {
                        passport.authenticate('local.admin')(req, res, function () {
                            // console.log(req.admin);
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
                    Instructor.find({})
                        .then((instructor) => {
                            // console.log(course);
                            res.render('admin/add_liveclass', { layout: 'backend', categorys: categorys, instructor: instructor });

                        })


                })
            // console.log(req.admin);
        } else {
            res.redirect('/admin/login');
        }
    })
    .post(upload.single('thumbnail'), (req, res) => {
        var filepath = path.join('/uploads') + '/' + req.file.filename;
        if (req.isAuthenticated()) {
            liveclass.create({
                title: req.body.title,
                category: req.body.category,
                instructor: req.body.instuctorname,
                level: req.body.level,
                day: req.body.day,
                month: req.body.month,
                time1: req.body.time1,
                time2: req.body.time2,
                link: req.body.meetlink,
                thumbnail: filepath,
            })


            // console.log(req.body);
            res.redirect('/admin/add-live-class')
        } else {
            res.redirect('/admin/login');
        }
    })
router
    .route('/live-class')
    .get((req, res) => {
        liveclass.find({})
            .then((data) => {
                res.render('admin/Liveclasses', { layout: 'backend', liveclass: data });

            })
    })
router
    .route('/live-class-delete/:id')
    .get((req, res) => {
        liveclass.findByIdAndDelete({ _id: req.params.id })
            .then(() => {
                res.redirect('/admin/live-class')
            })
    })
router
    .route('/user-profile')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            Admin.findById(req.user[0].id, (err, foundItems) => {
                if (!err) {
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
                    })
                }
            })
        } else {
            res.redirect('/admin/login');
        }
    })
    .post((req, res) => {
        Admin.findByIdAndUpdate(req.user[0].id,
            {
                fullname: req.body.fullname,
                state: req.body.state,
                phone: req.body.phone,
                address: req.body.address,
                postcode: req.body.postcode,
                companyname: req.body.companyname,
                cto: req.body.cto,
                city: req.body.city,
            }, { new: true, useFindAndModify: false },
            (err, d) => {
                if (err) console.log(err);
                else {
                    res.redirect('/admin/user-profile');
                };
            });
    })
router
    .route('/image-user-profile')
    .post(upload.single('image'), (req, res) => {
        Admin.findByIdAndUpdate(req.user[0].id,

            {
                image: req.file.filename,
            }

            , { new: true, useFindAndModify: false }, (err, d) => {
                if (err) console.log(err);
                else {
                    res.redirect('/admin/user-profile');
                };
            });
    })
router.post('/adminpassword', (req, res, next) => {
    Admin.findById(req.user[0].id)
        .then((user) => {
            if (req.body.newPassword === req.body.confirmPassword) {
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
    })


router
    .route('/seo-tool')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            settings.findOne({ name: 'studybee' })
            .then((setting) => {
              res.render('admin/seotools', { layout: 'backend', setting: setting })
            })
        } else {
            res.redirect('/admin/login');
        }
    })

    router.post('/seo-tool', function (req, res, next) {
        settings.findOneAndUpdate({ name: 'studybee' }, { $set: { siteName: req.body.siteName, siteTitle: req.body.siteTitle, siteDescription: req.body.siteDescription,analyticsId: req.body.analyticsId } })
          .then((settings) => {
            res.redirect('/admin/seo-tool')
            next
          })
      });

      router
    .route('/favicon-setting')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            settings.findOne({ name: 'studybee' })
            .then((setting) => {
              res.render('admin/favicon_setting', { layout: 'backend', setting: setting })
            })
        } else {
            res.redirect('/admin/login');
        }
    })
    router.post('/favicon-setting', upload.single('favicon'), function (req, res, next) {

        settings.findOneAndUpdate({ name: 'studybee' }, { $set: { favicon: req.file.filename } })
          .then(() => {
            res.redirect('/admin/favicon-setting')
            next
          })
      });
      
    router
    .route('/logo-setting')
    .get((req, res) => {
        if (req.isAuthenticated()) {
            settings.findOne({ name: 'studybee' })
            .then((setting) => {
              res.render('admin/sitelogo_setting', { layout: 'backend', setting: setting })
            })
        } else {
            res.redirect('/admin/login');
        }
    })
    router.post('/logo-setting', upload.single('logo'), function (req, res, next) {

        settings.findOneAndUpdate({ name: 'studybee' }, { $set: { logo: req.file.filename } })
          .then(() => {
            res.redirect('/admin/sitelogo_setting')
            next
          })
      });
      
    // router.get('/seo-tool', isAuthenticated, function (req, res, next) {
    //     settings.findOne({ name: 'studybee' })
    //       .then((setting) => {
    //         res.render('admin/seo-tool', { layout: 'backend', setting: setting })
    //       })
    //   })

module.exports = router;

function newFunction() {
    return require('aws-sdk');
}
