// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

categorySchema = new Schema({
   category: String

})

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;