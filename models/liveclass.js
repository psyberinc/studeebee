// Dependencies
const mongoose = require('mongoose')
// Variables
const Schema = mongoose.Schema;

liveclass = new Schema({
   title: String,
   category: String,
   level: String,
   instructor: String,
   day:String,
   month:String,
   time1:String,
    time2:String,
    link:String,
    thumbnail:String
})

const Liveclass = mongoose.model("liveclass", liveclass);

module.exports = Liveclass;