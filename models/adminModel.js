// Dependencies
const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

// Variables
const Schema = mongoose.Schema;


// Model
const adminSchema = new Schema({
  username:{
    type: String,
    required:true,
    trim:true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String
  },
  role: {
    type: String,
    default: "admin",
    enum: ["student", "teacher", "admin"],
  },
  registerToken:{
    type: String,
    default:null,
  },
  accessToken: {
    type: String,
    default: null
  },  
  fullname:{type:String},
  postcode:{type:String},
  state:{type:String},
  city:{type:String},
  address:{type:String},
  phone:{type:String},
  companyname:{type:String},
  cto:{type:String},
  image:{type:String}
});


// Plugin
adminSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
