require('dotenv').config();
require('./models/db');

// Dependecies
var session = require('express-session');
const express = require('express');
var MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');

// External Modules
const userController = require('./controllers/userController');
var settings = require('./models/settings')
const adminController = require('./controllers/adminController');
const frontWeb = require('./controllers/website');
const coursesController = require('./controllers/coursesController');
const blogController = require('./controllers/blogController');
const liveClassesController = require('./controllers/liveClassesController');
const instructorController = require('./controllers/instructorController');
const ApiController=require('./Api/User_api');



// Variables
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set( 'main','blank', 'backend', 'user');
//session
app.use(session(
  {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 180 * 60 * 1000 }
  }));


// passport
app.use(passport.initialize()); // invoke serializeuser method
app.use(passport.session()); // invoke deserializuser method


app.use(function (req, res, next) {

  res.locals.session = req.session;
  res.locals.login = req.login;
  if (req.user) {

    res.locals.isAuth = true;
    res.locals.user = req.user; 
    next();
  } else {
    res.locals.isAuth = false,
      next();
  }
})
app.use(flash())

//Globals vars 
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Api Route
app.use('/api', ApiController);
// Admin Route
app.use('/admin', adminController);
app.use(function (req, res, next) {
  settings.findOne({ name: "studybee" })
    .then((settings) => {
      if (settings.maintenance) {
        res.render("maintenance", { layout: "maintenance", title: settings.maintenance_title, description: settings.maintenance_description })

      } else {
        next()
      }
    })
})

// Front end
app.use('/', frontWeb);

// User Route
app.use('/user', userController);

// Blogs Route
app.use('/blogs', blogController);

// Courses Route
app.use('/courses', coursesController);

// Live-Classes Route
app.use('/live-classes', liveClassesController);


//Instructor /tutor /teacher Route
app.use('/instructor', instructorController);

app.get('/lec', (req, res) => {
  res.render('user/lectures');

})
app.get('/search/', (req, res) => {
  let q = req.query.filter;
  // let q = req.query.course.teacher;
  // console.log({filter: req.query.filter, course: req.query.course.qualification, second: req.query.second});
  console.log(q);
  res.send(q)

})



// Listen to Port
app.listen(PORT, () => {
  console.log(`Server started at port: ${PORT}`);
})
