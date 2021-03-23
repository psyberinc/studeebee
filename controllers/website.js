//Dependecies
const bcrypt = require("bcrypt");
const express = require('express');
const bodyParser = require('body-parser');
var router = express.Router();
var nodemailer=require('nodemailer')
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
   .route('/pro-coder')
    .get((req, res) => {
        res.render('studeebee/pro-coder',{layout:'main'})
    })
    router
    .route('/teacher')
    .get((req, res) => {
        res.render('studeebee/teacher',{layout:'main'})
    })
    router
    .route('/about-us-more')
    .get((req, res) => {
        res.render('studeebee/about2',{layout:'main'})
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
    .post(function(req,res){
        // Settings.findOne({name:'srudeebee'})
        // .then((setting)=>{
          // console.log(setting);
          var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "seo@psyber.co",
                pass: process.env.EMAIL_PASS,
              
              }
            
          });
          
          var mailOptions;
          mailOptions={
            from: req.body.email,
            to : "seo@psyber.co",
            subject : "Hi, "+req.body.email+" wants to contact u"+" regarding "+req.body.subject,
            html : "<html><p>Hi i am, "+req.body.fname+","+req.body.message+".<br> Best regards,"+req.body.fname+"Please Contact "+req.body.phno+"</p></html>"
            }
            smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                    // console.log(error);
                    res.end("error");
            }else{
                    res.redirect(req.get('referer'))
                    // console.log("Message sent: " + response.message);
                }
            }); 
        // })
      
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