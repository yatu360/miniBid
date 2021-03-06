const jsonWebToken = require('jsonwebtoken')

// This function checks if the token is valid when the
// user tries to access the APIs
function auth(req, res, next){
    const token = req.header('auth-token')
    if(!token){
        return res.status(401).send({message:'Acess denied'})
    }
    try{

        const verified = jsonWebToken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified
        next()

    }catch(err){
        return res.status(401).send({message:'Invalid token'})
    }
}

module.exports = auth