// Dependencies
const mongoose = require('mongoose')


// Variables
const Schema = mongoose.Schema;

question = new Schema({
 courseId:{ type: Schema.Types.ObjectId , ref: 'courses' },
    // first:String,
    // last:String,
    // answer:String
    question:[{
       title:{type:String},
       description:{type:String},
       user:{type:Schema.Types.ObjectId,ref:'users'},
       answer:[{
           name:{type:String},
           solution:{type:String}
       }],

    }]

})

module.exports = mongoose.model("q&a", question);

