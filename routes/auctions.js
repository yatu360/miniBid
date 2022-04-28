const express = require('express')
const router = express.Router()

const itemsModel = require('../models/Items')
const auctionsModel = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const { initializeTimeCalc } = require('../helper/TimerOperations')
const { setTimeLeft } = require('../helper/TimerOperations')
const { auctionEnd } = require('../helper/TimerOperations')


//Get all Auctions
router.get('/getAllAuctions', verifyToken, async(req, res)=>{
    try{
        const auctionItems = await auctionsModel.find()

        for(const auctionItem of auctionItems){

            var item = await itemsModel.findById(auctionItem.ItemInformation)
            const duration = initializeTimeCalc(item)
            if(duration._milliseconds>0){ 
            await auctionsModel.updateOne(
                {_id:auctionItem._id},
                {$set:{
                    timeleft: setTimeLeft(duration)
                    },

                }
            )
            }
            else{
                auctionEnd(auctionItem)
            }

        }


        return res.send(auctionItems)
    }catch(err){
        return res.status(400).send({message:err})
    }
})

//Update
router.patch('/bid/:itemId', verifyToken, async(req, res)=>{
    console.log("hello")
    const itemData = new auctionsModel({
       highestBid:req.body.highestBid
    })
    try{
        const getItem = await itemsModel.findById(req.params.itemId)
        const getAuct = await auctionsModel.findOne({ItemInformation: getItem})
        if (req.user._id === getItem.Owner.toString()){
            return res.status(400).send({message: 'You cannot bid on your own items'})
        }
        if (getAuct.highestBid<itemData.highestBid){

            const duration = initializeTimeCalc(getItem)

        const updatePostById = await auctionsModel.updateOne(
            {_id:getAuct._id},
            {$set:{
                highestBidder: req.user.username,
                highestBid:req.body.highestBid,
                timeleft: setTimeLeft(duration)
                },
            $push:{
                BidHistory:{
                    Bidder: req.user.username,
                    amount:req.body.highestBid
                }
            }
            }
        )
        res.send(updatePostById)
        }
        else{
            res.send("Please input a bid amount higher than "+getAuct.highestBid)
        }

    }catch(err){
        res.send({message:err})
    }
})




module.exports = router