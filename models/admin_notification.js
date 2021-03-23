// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

adminSchema = new Schema({
   notification:Array
   
})

const adminnoti = mongoose.model("Admin_notification", adminSchema);

module.exports = adminnoti;