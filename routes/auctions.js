const express = require('express')
const router = express.Router()

const itemsModel = require('../models/Items')
const auctionsModel = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const { initializeTimeCalc } = require('../helper/TimerOperations')
const { setTimeLeft } = require('../helper/TimerOperations')
const { auctionEnd } = require('../helper/TimerOperations')


//Get all Auctions
router.get('/getAuctions', verifyToken, async(req, res)=>{
    try{
        const auctionItems = await auctionsModel.find().select('-highestBidder')

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
            )}
            else{
                auctionEnd(auctionItem)
            }
        }
        return res.send(auctionItems)

    }catch(err){
        return res.status(400).send({message:err})
    }
})


//Get auctioned item details
router.get('/getAuction/:auctionId', verifyToken, async(req, res)=>{
    try{
        const auctionItem = await auctionsModel.findById(req.params.auctionId).populate('ItemInformation').select('-highestBidder')
            const duration = initializeTimeCalc(auctionItem.ItemInformation)
            if (duration._milliseconds>0) { 
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
            return res.send(auctionItem)
        }


    catch(err){
        return res.status(400).send({message:err})
    }
})

//Update
router.patch('/bid/:auctionId', verifyToken, async(req, res)=>{
    console.log("hello")
    const bidData = new auctionsModel({
       highestBid:req.body.highestBid
    })
    try{
        const getAuction = await auctionsModel.findById(req.params.auctionId).populate('ItemInformation')
        //const getItem = await itemsModel.findOne(getAuction.ItemInformation)
        if (req.user._id === getAuction.ItemInformation.Owner.toString()){
            return res.status(400).send({message: 'You cannot bid on your own items'})
        }
        if (getAuction.highestBid<bidData.highestBid){

            const duration = initializeTimeCalc(getAuction.ItemInformation)

        const updatePostById = await auctionsModel.updateOne(
            {_id:getAuction._id},
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
            res.send("Please input a bid amount higher than "+getAuction.highestBid)
        }

    }catch(err){
        res.send({message:err})
    }
})




module.exports = router