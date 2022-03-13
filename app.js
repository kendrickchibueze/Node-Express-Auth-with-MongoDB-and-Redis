const express = require('express')
const morgan = require('morgan')
const createError  = require('http-errors')
require('dotenv').config()
require('./helpers/init_mongodb')
const {verifyAccessToken} = require('./helpers/jwt_helper')
 require('./helpers/init_redis')


const AuthRoute = require('./Routes/Auth_route')

const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', verifyAccessToken, async(req, res, next) => {
   res.status(200).json({message:'we are here!'})
})

app.use('/auth', AuthRoute)

// if the above route is not found, it handle the error
app.use(async(req, res, next) => {
    next(createError.NotFound())
})

//error handling middleware
app.use((err,req,res,next) =>{
    res.status(err.status || 500)
    res.send({
        error:{
            status: err.status || 500,
            message: err.message
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT,() =>{
    console.log(`Server running on port ${PORT}`)
})