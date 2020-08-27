// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

adminSchema = new Schema({
   notification:Array
   
})

const usernoti = mongoose.model("User_notification", adminSchema);

module.exports = usernoti;