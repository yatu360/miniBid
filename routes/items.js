const express = require('express')
const router = express.Router()

const Items = require('../models/Items')
const Auct = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const timerOperations = require('../helper/TimerOperations')

const moment = require('moment')


//Post (Create Data)
router.post('/addItem', verifyToken, async(req, res)=>{
    const postData = new Items({
        ItemTitle:req.body.ItemTitle,
        isItemConditionNew:req.body.isItemConditionNew,
        ItemDesc:req.body.ItemDesc,
        Endtime:req.body.Endtime,
        Owner: req.user
    })

    var start_date = moment()
    var end_date = moment(req.body.Endtime, 'YYYY-MM-DD HH:mm:ss')
    var duration = moment.duration(end_date.diff(start_date));

    const PostAuct = new Auct({
        ItemInformation: postData,
        timeleft: "Years: "+duration._data.years+" Months: "+duration._data.months+" Days: "+duration._data.days+" Hours: "+duration._data.hours+
                    " Minutes: "+duration._data.minutes+" Seconds: "+duration._data.seconds
    })

    try{
        const postToSave = await postData.save()
        await PostAuct.save()
        res.send(postToSave)


    }catch(err){
        res.send({message:err})
    }
})

//Get all items
router.get('/getAllItems', verifyToken, async(req, res)=>{

    try{
        const items = await Items.find()
        res.send(items)
    }catch(err){
        res.status(400).send({message:err})
    }
})

//Get all Auctions
router.get('/getAllAuctions', verifyToken, async(req, res)=>{
    try{
        const AuctionItems = await Auct.find()

        for(const x of AuctionItems){

            var y = await Items.findById(x.ItemInformation)
            var start_date = moment()
            var end_date = moment(y.Endtime, 'YYYY-MM-DD HH:mm:ss')
            var duration = moment.duration(end_date.diff(start_date));
            if(duration._milliseconds>0){ 
            await Auct.updateOne(
                {_id:x._id},
                {$set:{
                    timeleft: "Years: "+duration._data.years+" Months: "+duration._data.months+" Days: "+duration._data.days+" Hours: "+duration._data.hours+
                    " Minutes: "+duration._data.minutes+" Seconds: "+duration._data.seconds
                    },

                }
            )
            }
            else{
                timerOperations.actionEnd(x)
            }

        }


        return res.send(AuctionItems)
    }catch(err){
        return res.status(400).send({message:err})
    }
})


//Get Item by id
router.get('/getItemById/:itemId', verifyToken, async(req, res)=>{
    try{
    const getItem = await Items.findById(req.params.itemId)
    res.send(getItem)

    }catch(err){
    res.send({message:err})
    }
})

//Do get items by author

//Do get items by category

//Update
router.patch('/bid/:itemId', verifyToken, async(req, res)=>{
    const itemData = new Auct({
       highestBid:req.body.highestBid
    })
    try{

        const getItem = await Items.findById(req.params.itemId)
        const getAuct = await Auct.findOne({ItemInformation: getItem})
        
        // if (req.user.username === getItem.author){
        //     res.status(400).send({message: 'You cannot bid on your own items'})
        // }
        if (getAuct.highestBid<itemData.highestBid){

            var start_date = moment()
            var end_date = moment(getItem.Endtime, 'YYYY-MM-DD HH:mm:ss')
            var duration = moment.duration(end_date.diff(start_date));

        const updatePostById = await Auct.updateOne(
            {_id:getAuct._id},
            {$set:{
                highestBidder: req.user.username,
                highestBid:req.body.highestBid,
                timeleft: "Years: "+duration._data.years+" Months: "+duration._data.months+" Days: "+duration._data.days+" Hours: "+duration._data.hours+
                " Minutes: "+duration._data.minutes+" Seconds: "+duration._data.seconds
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

