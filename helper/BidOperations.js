const bidOperations = {

    bidValidations(user_id, getAuction, bidData, duration){
        // if (user_id === getAuction.ItemInformation.Owner.toString()){
        if(false){
            return  'You cannot bid on your own items'

        }else if(duration._milliseconds<0){
            return 'Auction has ended. Bidding time has lapsed'

        }else if(getAuction.highestBid>bidData.highestBid){
            return "Please input a bid amount higher than "+getAuction.highestBid
        }
    }
}

module.exports = bidOperations;
