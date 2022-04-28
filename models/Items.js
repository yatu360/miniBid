const mongoose = require('mongoose');

const ItemsSchema  = mongoose.Schema({
    ItemTitle:{type:String, required:true},
    ItemRegTimeStamp:{type: Date, default:Date.now},
    isItemConditionNew:{type: Boolean, default: false},
    ItemDesc:{type:String,required:true},
    Endtime:{type:Date,required:true},
    Owner: {type:mongoose.Schema.Types.ObjectId,ref:'users'}
});

module.exports = mongoose.model('items',ItemsSchema)