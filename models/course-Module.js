// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

courseSchema = new Schema({
    course_id: mongoose.Schema.Types.ObjectId,
    content: Array,
})

const modules = mongoose.model("Course_Module", courseSchema);

module.exports = modules;