const express = require('express')
const router = express.Router()

const Items = require('../models/Items')
const Auct = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const moment = require('moment')

const timerOperations ={

    async auctionEnd (auction){
        await Auct.updateOne(
            {_id:auction._id},
            {$set:{
                timeleft: "Years: "+00 +" Months: "+00+" Days: "+00+" Hours: "+00+
                " Minutes: "+00+" Seconds: "+00,
                isOpen: false,
                Winner: auction.highestBidder
                },
            }
        )
    },

    setTimeLeft(duration){
        return "Years: "+duration._data.years+" Months: "+duration._data.months+" Days: "+duration._data.days+" Hours: "+duration._data.hours+
        " Minutes: "+duration._data.minutes+" Seconds: "+duration._data.seconds
    },

    initializeTimeCalc(item){
        var start_date = moment()
        var end_date = moment(item.Endtime, 'YYYY-MM-DD HH:mm:ss')
        return moment.duration(end_date.diff(start_date));
    }


}

module.exports = timerOperations;