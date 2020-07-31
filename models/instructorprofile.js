// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

InstructorProfileSchema = new Schema({
    userId: mongoose.Schema.Types.ObjectId,
    fullName: String,
    phone: String,
    occupation:String,
    companyname:String,
    address: String,
    postcode: String,
    linkedin: String,
    facebook: String,
    twitter: String,
    instagram: String
})

const InstructorProfile = mongoose.model("instructorProfile", InstructorProfileSchema);

module.exports = InstructorProfile;