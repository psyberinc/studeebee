const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

//Models
const User = require('../models/usersModel');
const Admin = require('../models/adminModel');
const Instructor = require('../models/instructor');



passport.serializeUser(function (user, done) {
    // console.log("checking user "+user);
    done(null, user.id);
});
passport.deserializeUser((id,done)=>{
    User.find({_id:id},(err,user)=>{
        // console.log(Object.values(user));
        if(user.length == 0){
            Admin.find({_id:id},(err,user1)=>{
                // console.log("comeing "+user1);
                done(err,user1);
            })
        }
        else{
            
                done(err,user);
           
        }
    })
})

/*
------------------------
User 
------------------------
*/
passport.use(User.createStrategy());

// Use Passport Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/auth/google/studeebee",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOne({ 'email': profile.emails[0].value }, function (err, user) {
            if (err) {
                return cb(err);
            }
            // No User was found- Create One
            if (!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: null,
                    isVerified: true,
                    provider: 'Google',
                    // Now in the future searching of User.findOne({'google.id': profile.id } will match because of this next line
                    google: profile._json
                })
                user.save(function (err) {
                    if (err) console.log(err);
                    return cb(err, user);
                });
            } else {
                // foundUser return
                return cb(err, user);
            }
        });
    }
));

// Use Passport Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/user/auth/facebook/studeebee",
    enableProof: true,
    profileFields: ['id', 'email', 'displayName']
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOne({ 'email': profile.emails[0].value }, function (err, user) {
            if (err) {
                return cb(err);
            }
            // No User was found- Create One
            if (!user) {
                user = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    password: null,
                    isVerified: true,
                    provider: 'Facebook',
                    // Now in the future searching of User.findOne({'facebook.id': profile.id } will match because of this next line
                    google: profile._json
                })
                user.save(function (err) {
                    if (err) console.log(err);
                    return cb(err, user);
                });
            } else {
                // foundUser return
                return cb(err, user);
            }
        });
    }
));


/*
------------------------
Admin 
------------------------
*/
passport.use('local.admin', Admin.createStrategy());

/*
------------------------
Instructor
------------------------
*/
passport.use('instructor-login', Instructor.createStrategy());
module.exports= passport;