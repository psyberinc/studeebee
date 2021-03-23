// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

ContactSchema = new Schema({
   name: String,
   email: String,
   subject: String,
   phno: String,
   message: String,
   
})

const Contact = mongoose.model("Get_in_touch", ContactSchema);

module.exports = Contact;