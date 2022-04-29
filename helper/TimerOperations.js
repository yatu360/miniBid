const auctionsModel = require('../models/Auctions')

const moment = require('moment')

const timerOperations ={

    async auctionEnd (auction){
        await auctionsModel.updateOne(
            {_id:auction._id},
            {$set:{
                timeleft: "Years:"+00 +", Months:"+00+", Days:"+00+", Hours:"+00+
                ", Minutes:"+00+", Seconds:"+00,
                isOpen: false,
                Winner: auction.highestBidder
                },
            }
        )
    },

    setTimeLeft(duration){
        return "Years:"+duration._data.years+", Months:"+duration._data.months+", Days:"+duration._data.days+", Hours:"+duration._data.hours+
        ", Minutes:"+duration._data.minutes+", Seconds:"+duration._data.seconds
    },

    calculateTimeLeft(item){
        var start_date = moment()
        var end_date = moment(item.Endtime, 'YYYY-MM-DD HH:mm:ss')
        return moment.duration(end_date.diff(start_date));
    },

    async updateTimer(item, auctionItem){
        const duration = timerOperations.calculateTimeLeft(item)
        if(duration._milliseconds>0){
            await auctionsModel.updateOne(
                {_id:auctionItem._id},
                {$set:{
                    timeleft: timerOperations.setTimeLeft(duration), 
                    },
                }
            )
            console.log(timerOperations.setTimeLeft(duration)) 
            }
            else{
                timerOperations.auctionEnd(auctionItem)
            }
    }


}

module.exports = timerOperations;