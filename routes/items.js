const express = require('express')
const router = express.Router()

const itemsModel = require('../models/Items')
const auctionsModel = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const { calculateTimeLeft, 
        setTimeLeft, 
        openAuctionTimerUpdate 
    } = require('../helper/TimerOperations')

const {reAuctionValidations} = require('../helper/InputValidations')



//Post (Create Data)
router.post('/addItem', verifyToken, async(req, res)=>{
    const postData = new itemsModel({
        ItemTitle:req.body.ItemTitle,
        isItemConditionNew:req.body.isItemConditionNew,
        ItemDesc:req.body.ItemDesc,
        Endtime:req.body.Endtime,
        Owner: req.user
    })

    const duration = calculateTimeLeft(req.body)

    const PostAuct = new auctionsModel({
        ItemInformation: postData,
        timeleft: setTimeLeft(duration)
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
        const items = await itemsModel.find()
        res.send(items)
    }catch(err){
        res.status(400).send({message:err})
    }
})

//Get Item by id
router.get('/getItemById/:itemId', verifyToken, async(req, res)=>{
    try{
    const getItem = await itemsModel.findById(req.params.itemId)
    res.send(getItem)

    }catch(err){
    res.send({message:err})
    }
})

//Get Item by id
router.get('/getSoldItems', verifyToken, async(req, res)=>{
    try{
        
        await openAuctionTimerUpdate()

        return res.send(await itemsModel.find({isSold: true}))

    }catch(err){
    res.send({message:err})
    }
})


router.patch('/reAuction/:itemId', verifyToken, async(req, res)=>{
    const postData = new itemsModel({
        Endtime:req.body.Endtime,
    })
    try{
        const getItem = await itemsModel.findById(req.params.itemId)
        
        var duration = calculateTimeLeft(getItem)
       
        const message = reAuctionValidations(req.user._id, getItem, postData, duration)

        if (message){
            return res.status(400).send({message: message})
        }
   
        const updatePostById = await itemsModel.findByIdAndUpdate(req.params.itemId,
            {
                Endtime:postData.Endtime
            }
        )

        duration = calculateTimeLeft(updatePostById)
        
        const PostAuction = new auctionsModel({
            ItemInformation: updatePostById,
            timeleft: setTimeLeft(duration)
        })       
        await PostAuction.save()
        res.send(PostAuction)
    }catch(err){
        res.send({message:err})
    }
})

router.get('/getItemsByOwner/:userid', verifyToken, async(req, res)=>{
    try{
        
        await openAuctionTimerUpdate()

        return res.send(await itemsModel.find({Owner:{_id:req.params.userid}}))

    }catch(err){
    res.send({message:err})
    }
})


module.exports = router

