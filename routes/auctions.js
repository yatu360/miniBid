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




module.exports = router