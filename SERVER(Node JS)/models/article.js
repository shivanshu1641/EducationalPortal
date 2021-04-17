const mongoose = require("mongoose")
const marked = require('marked')


const articleSchema = new mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    price:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default: Date.now
    },

    file:{
        data:Buffer,
        type:String,
        required:true
    }

})

module.exports = mongoose.model("Article",articleSchema)