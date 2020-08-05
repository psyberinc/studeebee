//Dependecies
const bcrypt = require("bcrypt");
const express = require('express');
const bodyParser = require('body-parser');
var router = express.Router();

//Models
const User = require('../models/usersModel');
const Blog = require('../models/blogModel');
const { route } = require("./userController");
const Course = require("../models/courseModel");
const Contact=require("../models/Get_in_Touch");




// Get Routes
// ____________________________________________

router
    .route('/')
    .get((req, res) => {
        Course.find({}, (err, foundItem) => {
            if (!err && foundItem) {
                Blog.find({}, (err, foundBlog) => {
                    if (!err && foundBlog) {
                        res.render('studeebee/index', {layout:'main',
                            course: foundItem,
                            blog: foundBlog
                        });
                    }
                })
            }
        })
    })

router
    .route('/home')
    .get((req, res) => {
        res.redirect('/');
    })

router
    .route('/about-us')
    .get((req, res) => {
        res.render('studeebee/about',{layout:'main'})
    })

router
    .route('/faq')
    .get((req, res) => {
        res.render('studeebee/faq',{layout:'main'})
    })

router
    .route('/contact-us')
    .get((req, res) => {
        res.render('studeebee/contact',{layout:'main'})
    })
    .post((req,res)=>{
        // console.log("Hello= "+req.body.fname+ req.body.email+req.body.subject);
        Contact.create({
            name: req.body.fname,
            email: req.body.email,
            subject: req.body.subject,
            phno: req.body.phno,
            message: req.body.message,
        })
        res.redirect('/contact-us');
        // res.json(req.body);
    })
router
    .route('/private-policy')
    .get((req, res) => {
        res.render('studeebee/privacy',{layout:'main'})
    })

router
    .route('/terms-and-conditions')
    .get((req, res) => {
        res.render('studeebee/tnc',{layout:'main'})
    })

router
    .route('/memberships')
    .get((req, res) => {
        res.render('studeebee/membership',{layout:'main'})
    })



module.exports = router;