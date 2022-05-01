const express = require("express");
const router = express.Router();

const auctionsModel = require("../models/Auctions");

const verifyToken = require("../verifyToken");

const {
    calculateTimeLeft,
    updateTimer,
    openAuctionTimerUpdate,
    setTimeLeft,
} = require("../helper/TimerOperations");

const { bidValidations } = require("../helper/InputValidations");

/**
 * Get - getOpenAuctions API - Sends all the auctions which are still
 * open and inprogress
 */
router.get("/getOpenAuctions", verifyToken, async (req, res) => {
    try {
        await openAuctionTimerUpdate();

        return res.send(
            await auctionsModel.find({ isOpen: true }).select("-highestBidder")
        );
    } catch (err) {
        return res.status(400).send({ message: err });
    }
});

/**
 * Get - getAuction API - Sends the auction information of the id received
 * in the params
 */
router.get("/getAuction/:auctionId", verifyToken, async (req, res) => {
    try {
        const auctionItem = await auctionsModel
            .findById(req.params.auctionId)
            .populate("ItemInformation");
        await updateTimer(auctionItem.ItemInformation, auctionItem);

        return res.send(
            await auctionsModel
                .findById(req.params.auctionId)
                .populate("ItemInformation")
                .select("-highestBidder")
        );
    } catch (err) {
        return res.status(400).send({ message: err });
    }
});

/**
 * Patch - bid API - Places a bid for the auction with id 
 * received in the params
 */
router.patch("/bid/:auctionId", verifyToken, async (req, res) => {
    const bidData = new auctionsModel({
        highestBid: req.body.highestBid,
    });
    try {
        const getAuction = await auctionsModel
            .findById(req.params.auctionId)
            .populate("ItemInformation");

        const duration = calculateTimeLeft(getAuction.ItemInformation);

        // Checks if the bid is valid and can be placed
        const message = bidValidations(
            req.user._id,
            getAuction,
            bidData,
            duration
        );

        if (message) {
            return res.status(400).send({ message: message });
        }

        const updatePostById = await auctionsModel.updateOne(
            { _id: getAuction._id },
            {
                $set: {
                    highestBidder: req.user.username,
                    highestBid: bidData.highestBid,
                    timeleft: setTimeLeft(duration),
                },
                $push: {
                    BidHistory: {
                        Bidder: req.user._id,
                        amount: req.body.highestBid,
                    },
                },
            }
        );
        res.send(updatePostById);
    } catch (err) {
        res.send({ message: err });
    }
});

/**
 * Get - getBidHistory API - Retrives the bid history of the auction with id
 * embedded into the params
 */
router.get("/getBidHistory/:auctionId", verifyToken, async (req, res) => {
    try {
        const auctionItem = await auctionsModel.findById(req.params.auctionId);
        return res.send(auctionItem.BidHistory);
    } catch (err) {
        return res.status(400).send({ message: err });
    }
});

module.exports = router;
