// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

courseSchema = new Schema({
    creator_id: mongoose.Schema.Types.ObjectId,
    title: String,
    instructor: String,
    price: Number,
    discount:Number,
    category: String,
    level: String,
    language: String,
    prereq: Array,
    outcome: Array,
    description: String,
    thumbnail: String,
    createdAt:Date,
    LastUpdatedAt:Date,
    // Module:Array,
    content: [{
        created_At:Date,
        module_description:String,
        additional_link:String,
        sectionTitle:String,
        sectionVideoTitle:Array,
        sectionVideoUrl:Array,
        videoDuration:Array
    }

    ],
   
    approved:{type:Boolean, default:false, enum:[true,false]}
},{strict : false});
// videoCategories:[{
//     videoCategory:{
//         type:String,
//         required:true,   
//     },
//     videoTitle:[{type:String}],
//     videoName:[{type:String}]
// }],


const Course = mongoose.model("Course", courseSchema);

module.exports = Course;

