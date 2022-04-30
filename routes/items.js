const express = require('express')
const router = express.Router()

const itemsModel = require('../models/Items')
const auctionsModel = require('../models/Auctions')

const verifyToken = require('../verifyToken')

const { calculateTimeLeft } = require('../helper/TimerOperations')
const { setTimeLeft } = require('../helper/TimerOperations')




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


router.patch('/reAuction/:itemId', verifyToken, async(req, res)=>{
    const postData = new itemsModel({
        Endtime:req.body.Endtime,
    })
    try{
        const getItem = await itemsModel.findById(req.params.itemId)
        
        var duration = calculateTimeLeft(getItem)

        if (duration._milliseconds > 0 ){
            return res.send("Cannot be reauctioned while bidding is in progress")
        }
        else if (getItem.isSold == true){
            return res.send("Cannot reauction sold item")
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

//Do get items by author






module.exports = router

