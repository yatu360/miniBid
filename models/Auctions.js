const mongoose = require('mongoose');


const AuctionsSchema  = mongoose.Schema({
    //'author':{type:mongoose.Schema.Types.ObjectId,ref:'UserCollection'},
    ItemInformation: {type:mongoose.Schema.Types.ObjectId, ref:'items'},
    highestBidder:{type:String, default:null},
    highestBid:{type:Number, default:0 },
    isOpen:{type:Boolean, default:true},
    timeleft:{type:String},
    BidHistory:[{amount: {type: Number}, BidDate:{type:Date, default: Date.now}}],
    Winner: {type:String, default: null}

});

module.exports = mongoose.model('auctions',AuctionsSchema)