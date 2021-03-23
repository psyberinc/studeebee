var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var settings = new Schema({
    maintenance:{
        type:Boolean,
        default:false
    },
    maintenance_title:{
        type:String,
    },
    maintenance_description:{
        type:String,
    },
    name:{
        type:String,
    },
    siteName:{
        type:String,
        // required:true,
    },
    siteTitle:{
        type:String,
        // required:true,
    },
    siteDescription:{
        type:String,
    },
    logo:{
        type:String,
        // required:true,
    },
    favicon:{
        type:String,
        // required:true,
    },
    analyticsId:{
        type:String,
        // required:true,
    },
    contactEmail:{
        type:String,
        // required:true,
    },
    contactPhone:{
        type:String,
        // required:true,
    },
    contactLocation:{
        type:String,
        // required:true,
    },
    merchantId:{
        type:String,
        // required:true,
    },
    website:{
        type:String,
        // required:true,
    },
    industryType:{
        type:String,
        // required:true,
    },
    channelId:{
        type:String,
        // required:true,
    },
    callbackUrl:{
        type:String,
        // required:true,
    },
    transactionUrl:{
        type:String,
        // required:true,
    },
    merchantKey:{
        type:String
    }
},{
    timestamps:true,
})

const Settings = mongoose.model('settings',settings);
// Settings.create({name:"studybee",maintenance:"false"})
module.exports = Settings;