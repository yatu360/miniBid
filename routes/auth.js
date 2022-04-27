const express = require ('express')
const res = require('express/lib/response')
const router = express.Router()

const User = require('../models/Users')
const {registerValidation, loginValidation} = require('../validations/validation')

const bcryptJs = require('bcryptjs')

const jsonWebToken = require('jsonwebtoken')

router.post('/register', async(req,res)=>{

    //Validation 1 to check user input
    const {error} = registerValidation(req.body)
    if (error){
        return res.status(400).send({message: error['details'][0]['message']})
    }
    
    //Validation 2 to check if user exists!
    const userExist = await User.findOne({email:req.body.email})
    const usernameExist = await User.findOne({username:req.body.username})
    if (userExist){
        return res.status(400).send({message: 'User already exists'})
    }
    else if(usernameExist){
        return res.status(400).send({message: 'Username is taken, please choose another one'})
    }

    const salt = await bcryptJs.genSalt(5)
    const hashPassword = await bcryptJs.hash(req.body.password, salt)

    // Code to insert data
    const user = new User ({
        username:req.body.username,
        email:req.body.email,
        password:hashPassword
    })
    try{
        const savedUser = await user.save()
        res.send(savedUser)
    } catch(err){
        res.status(400).send({message:err})
    }

})



router.post('/login', async(req,res)=>{

    //Validation 1 to check user input
    const {error} = loginValidation(req.body)
    if (error){
        return res.status(400).send({message: error['details'][0]['message']})
    }


    //Validation 2 to check if user exists!
    const user = await User.findOne({email:req.body.email})
    if (!user){
        return res.status(400).send({message: 'User does not exist'})
    }

    //Validation 3 to check user password
     const passwordValidation = await bcryptJs.compare(req.body.password, user.password)
     if (!passwordValidation){
        return res.status(400).send({message: 'Password incorrect'})
     }

     //Generate Auth token
     const token = jsonWebToken.sign({_id:user._id, username:user.username, email: user.email}, process.env.TOKEN_SECRET)
     res.header('auth-token',token).send({'auth-token':token})


} )

module.exports =  router