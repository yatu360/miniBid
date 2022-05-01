const { calculateTimeLeft } = require("../helper/TimerOperations");


/**
 * This class contains helper methods which validates user input
 */
const inputValidations = {

    /**
     * Helper method which validates the authenticity of a bid. If the
     * bid is invalid an error message is returned and if bid is valid,
     * nothing is returned. 
     * @param user_id - The id of the user who is trying to bid
     * @param getAuction - The dataset of the auction, that is to be
     * bidded on.
     * @param bidData - The data of the bid.
     * @param duration - Contains information regarding the time left.
     * @returns String message.
     */
    bidValidations(user_id, getAuction, bidData, duration) {

        // Checked user validitiy, prevent owner of item from bidding
        if (user_id === getAuction.ItemInformation.Owner.toString()) {
            return "You cannot bid on your own items";

        // Checks if the auction is still running (there is time left)
        } else if (duration._milliseconds < 0) {
            return "Auction has ended. Bidding time has lapsed";

        // Checks if the bid is higher than the current bid
        } else if (getAuction.highestBid > bidData.highestBid) {
            return (
                "Please input a bid amount higher than " + getAuction.highestBid
            );
        }
    },

    /**
     * Helper method which validates if an item can be re-auctioned. If
     * validity false, the function returns an error message. If validity
     * is true, nothing is returned.
     * @param user_id - The id of the user who is trying to re-auction
     * an item
     * @param getItem - The dataset of the the item that is to be re-
     * auctioned.
     * @param postData - Contains the new end time of the new auction.
     * @param duration - Contains information regarding the time left.
     * @returns String message.
     */
    reAuctionValidations(user_id, getItem, postData, duration) {

        // Checks user validity, prevents non-owners from
        // re-auctioning an item
        if (user_id !== getItem.Owner._id.toString()) {
            return "Unauthorized access";
        
        // Checks if an auction is still in progress but checking
        // the time remaining of the existing auction.
        } else if (duration._milliseconds > 0) {
            return "Cannot be reauctioned while bidding is in progress";

        // Checks if the item is sold
        } else if (getItem.isSold === true) {
            return "Cannot reauction sold item";
        
        // Checks if the user puts a time in advance, the restriction
        // prevents user from entering a time less than a minute in advance.
        } else if (calculateTimeLeft(postData)._milliseconds < 60000) {
            return "Please input time atleast 1 minute in advance";
        }
    },
};

module.exports = inputValidations;
