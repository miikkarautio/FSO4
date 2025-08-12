const jwt = require('jsonwebtoken')
const User = require('../models/user')

const errorHandler = (error, request, response, next) => {
    if(error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')){
        return response.status(400).json({ error: 'expected `username` to be unique' })
    } else if(error.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if(authorization && authorization.startsWith('Bearer ')) {
        request.token = authorization.replace('Bearer ', '')
    }
    next()
}

const userExtractor = async (request, response, next) => {
    
    const token = request.token

    if (!token) {
    return response.status(401).json({ error: 'token missing' })
    }

    let user
    try {
        user = jwt.verify(token, process.env.SECRET) //Tarkistetaan token
        const dbUser = await User.findById(user.id) //Haetaan käyttäjä tietokannasta
        if(!dbUser){
            return response.status(401).json({ error: 'user not found' }) //Jos ei ole käyttäjää
        }
        request.user = dbUser //asetetaan käyttäjä request.userille
    } catch (error) {
        return response.status(401).json({ error: 'token invalid' }) //Jos token on väärä
    }

    next()
}


module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}