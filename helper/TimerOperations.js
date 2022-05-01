const auctionsModel = require("../models/Auctions");
const itemsModel = require("../models/Items");
const moment = require("moment");

/**
 * Class contains helper methods which aid in the
 * calculation of the timer left for the auction.
 */
const timerOperations = {

    /**
     * This helper method is called when the auction ends
     * and sets the data for the ended auction.
     * @param auction - Contains the item's auction
     * data. 
     */
    async auctionEnd(auction) {
        await auctionsModel.updateOne(
            { _id: auction._id },
            {
                $set: {
                    timeleft:
                        "Years:" + 00 +
                        ", Months:" + 00 +
                        ", Days:" + 00 +
                        ", Hours:" + 00 +
                        ", Minutes:" + 00 +
                        ", Seconds:" + 00,
                    isOpen: false,
                    Winner: auction.highestBidder,
                },
            }
        );
        if (auction.highestBidder != null) {
            await itemsModel.findByIdAndUpdate(
                auction.ItemInformation._id.toString(),
                {
                    isSold: true,
                }
            );
        }
    },

    /**
     * This helper method is called to format the time-
     * left in a string format
     * @param duration Contains calculated time information
     * @returns String format of time left
     */
    setTimeLeft(duration) {
        return (
            "Years:" + duration._data.years +
            ", Months:" + duration._data.months +
            ", Days:" + duration._data.days +
            ", Hours:" + duration._data.hours +
            ", Minutes:" + duration._data.minutes +
            ", Seconds:" + duration._data.seconds
        );
    },

    /**
     * This helper method calculates the timeleft of the 
     * auction. This is done using the moment library. 
     * @param item Contains item information  
     * @returns Calculated time as a moment object.
     */
    calculateTimeLeft(item) {
        var now_time = moment();
        var end_time = moment(item.Endtime, "YYYY-MM-DD HH:mm:ss");
        return moment.duration(end_time.diff(now_time));
    },

    /**
     * This helper method updates the data stored in the auction
     * object with the updated timer counter
     * @param item - Contains item information 
     * @param auctionItem - Contain the auction item information
     */
    async updateTimer(item, auctionItem) {
        const duration = timerOperations.calculateTimeLeft(item);
        if (duration._milliseconds > 0) {
            await auctionsModel.updateOne(
                { _id: auctionItem._id },
                {
                    $set: {
                        timeleft: timerOperations.setTimeLeft(duration),
                    },
                }
            );
        } else {
            await timerOperations.auctionEnd(auctionItem);
        }
    },

    /**
     * This helper method finds all the open auction then 
     * iterates through each one to update their timers
     */
    async openAuctionTimerUpdate() {
        const auctionItems = await auctionsModel
            .find({ isOpen: true })
            .populate("ItemInformation");

        for (const auctionItem of auctionItems) {
            await timerOperations.updateTimer(
                auctionItem.ItemInformation,
                auctionItem
            );
        }
    },
};

module.exports = timerOperations;
