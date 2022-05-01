const express = require("express");
const router = express.Router();

const itemsModel = require("../models/Items");
const auctionsModel = require("../models/Auctions");

const verifyToken = require("../verifyToken");

const {
    calculateTimeLeft,
    setTimeLeft,
    openAuctionTimerUpdate,
} = require("../helper/TimerOperations");

const { reAuctionValidations } = require("../helper/InputValidations");

/**
 * Post- addItem API - adds item into the apps inventory
 */
router.post("/addItem", verifyToken, async (req, res) => {
    // Creates an item object
    const postData = new itemsModel({
        ItemTitle: req.body.ItemTitle,
        isItemConditionNew: req.body.isItemConditionNew,
        ItemDesc: req.body.ItemDesc,
        Endtime: req.body.Endtime,
        Owner: req.user,
    });

    // Calls helper method to calculate the time left
    const duration = calculateTimeLeft(req.body);

    // Creates and auction object
    const PostAuct = new auctionsModel({
        ItemInformation: postData,
        timeleft: setTimeLeft(duration),
    });

    // Saves the item and auction object in the
    // relavant databases
    try {
        const postToSave = await postData.save();
        await PostAuct.save();
        res.send(postToSave);
    } catch (err) {
        res.send({ message: err });
    }
});

/**
 * Get - getAllItems API - Sends all items stored in the database
 */
router.get("/getAllItems", verifyToken, async (req, res) => {
    try {
        await openAuctionTimerUpdate();
        const items = await itemsModel.find();
        res.send(items);
    } catch (err) {
        res.status(400).send({ message: err });
    }
});

/**
 * Get - getItemById API - Sends item with id from params
 */
router.get("/getItemById/:itemId", verifyToken, async (req, res) => {
    try {
        await openAuctionTimerUpdate();
        const getItem = await itemsModel.findById(req.params.itemId);
        res.send(getItem);
    } catch (err) {
        res.send({ message: err });
    }
});

/**
 * Get - getSoldItems API - Sends all sold items
 */
router.get("/getSoldItems", verifyToken, async (req, res) => {
    try {
        await openAuctionTimerUpdate();
        return res.send(await itemsModel.find({ isSold: true }));
    } catch (err) {
        res.send({ message: err });
    }
});

/**
 * Patch - reAuction API - Reauctions unsold item
 */
router.patch("/reAuction/:itemId", verifyToken, async (req, res) => {
    const postData = new itemsModel({
        Endtime: req.body.Endtime,
    });
    try {
        const getItem = await itemsModel.findById(req.params.itemId);

        var duration = calculateTimeLeft(getItem);

        //Checks if item can be re-auctioned
        const message = reAuctionValidations(
            req.user._id,
            getItem,
            postData,
            duration
        );

        if (message) {
            return res.status(400).send({ message: message });
        }

        const updatePostById = await itemsModel.findByIdAndUpdate(
            req.params.itemId,
            {
                Endtime: postData.Endtime,
            }
        );

        duration = calculateTimeLeft(postData);

        const postAuction = new auctionsModel({
            ItemInformation: updatePostById,
            timeleft: setTimeLeft(duration),
        });
        await postAuction.save();
        res.send(postAuction);
    } catch (err) {
        res.send({ message: err });
    }
});

/**
 * Get - getItemsByOwner API - Send all items uploaded by a particular user
 */
router.get("/getItemsByOwner/:userid", verifyToken, async (req, res) => {
    try {
        // Updates timer to get the updated information
        await openAuctionTimerUpdate();

        return res.send(
            await itemsModel.find({ Owner: { _id: req.params.userid } })
        );
    } catch (err) {
        res.send({ message: err });
    }
});

module.exports = router;
