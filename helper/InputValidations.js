const { calculateTimeLeft} = require('../helper/TimerOperations')

const inputValidations = {

    bidValidations(user_id, getAuction, bidData, duration){
        if (user_id === getAuction.ItemInformation.Owner.toString()){
            return  'You cannot bid on your own items'
            
        }else if(duration._milliseconds<0){
            return 'Auction has ended. Bidding time has lapsed'

        }else if(getAuction.highestBid>bidData.highestBid){
            return "Please input a bid amount higher than "+getAuction.highestBid
        }
    },

    reAuctionValidations(user_id, getItem, postData, duration){
        if (user_id !== getItem.Owner._id.toString()){
            return "Unauthorized access"
        
        }else if (duration._milliseconds > 0 ){
            return "Cannot be reauctioned while bidding is in progress"
        
        } else if (getItem.isSold === true){
            return "Cannot reauction sold item"
        
        } else if (calculateTimeLeft(postData)._milliseconds < 60000){
            return "Please input time atleast 1 minute in advance"
        }
    }
}

module.exports = inputValidations;
