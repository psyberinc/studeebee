// Dependencies
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');
// Variables
const Schema = mongoose.Schema;
// Model
const userSchema = new Schema({
  username:{
    type: String,
    trim:true,
  },
  email: {
    type: String,
    
    trim: true,
  },
  password: {
    type: String
  },
  role: {
    type: String,
    default: "student",
    enum: ["student", "teacher", "admin"],
  },
  isVerified:{
    type:Boolean,
    default: false,
    enum: ["true","false"]
  },
  registerToken:{
    type: String,
    default:null,
  },
  accessToken: {
    type: String,
  },
  fullName: String,
  phone: String,
  college: String,
  address: String,
  postcode: String,
  linkedin: String,
  facebook: String,
  twitter: String,
  instagram: String,
  image:String,
  
  resetPasswordToken: {type:String},
  resetPasswordExpires: {type:Date},
});

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();

  user.setPassword(user.password,function(err){
          if (err) return next(err);
      // user.password = hash;
      next();
  })
});

// Plugin
userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const User = mongoose.model("user", userSchema);

module.exports = User;
