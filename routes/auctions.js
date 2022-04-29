const express = require('express')
const router = express.Router()

const itemsModel = require('../models/Items')
const auctionsModel = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const { calculateTimeLeft, updateTimer } = require('../helper/TimerOperations')
const { setTimeLeft } = require('../helper/TimerOperations')
const {bidValidations} = require('../helper/BidOperations')


//Get all Auctions
router.get('/getAuctions', verifyToken, async(req, res)=>{
    try{
        const auctionItems = await auctionsModel.find()

        for(const auctionItem of auctionItems){
            const item = await itemsModel.findById(auctionItem.ItemInformation)
            await updateTimer(item, auctionItem)
        }
        return res.send(await auctionsModel.find().select('-highestBidder'))

    }catch(err){
        return res.status(400).send({message:err})
    }
})


//Get auctioned item details
router.get('/getAuction/:auctionId', verifyToken, async(req, res)=>{
    try{
        const auctionItem = await auctionsModel.findById(req.params.auctionId).populate('ItemInformation')
        await updateTimer(auctionItem.ItemInformation, auctionItem)
        
        return res.send(await auctionsModel.findById(req.params.auctionId).populate('ItemInformation').select('-highestBidder'))
    }
    catch(err){
        return res.status(400).send({message:err})
    }
    
})

//Update
router.patch('/bid/:auctionId', verifyToken, async(req, res)=>{
    const bidData = new auctionsModel({
       highestBid:req.body.highestBid
    })
    try{
        const getAuction = await auctionsModel.findById(req.params.auctionId).populate('ItemInformation')
        const duration = calculateTimeLeft(getAuction.ItemInformation)
        const message = bidValidations(req.user._id, getAuction, bidData, duration)

        if (message){
            return res.status(400).send({message: message})
        }

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
    }catch(err){
        res.send({message:err})
    }
})




module.exports = router