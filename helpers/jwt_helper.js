const JWT = require('jsonwebtoken');
const createError = require('http-errors')
const client = require('./init_redis')

module.exports = {
    signAccessToken:(userId) =>{
       return new Promise((resolve, reject) =>{
           const payload = {}
           const secret =process.env.ACCESS_TOKEN_SECRET
           const options ={
               expiresIn:"1hr",
               issuer : "https://digitalpearls.site/?page_id=11",
               audience:userId
           }
           JWT.sign(payload, secret, options, (err, token) =>{
               if(err) {
                console.log(err.message)
                 reject(createError.InternalServerError())
               }

               resolve(token)
           })
       })
    },
    verifyAccessToken : (req, res, next ) =>{
        if(!req.headers['authorization']) return next(createError.Unauthorized())
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token,process.env.ACCESS_TOKEN_SECRET, (err,payload) => {
            if(err){
                // if(err.name === 'JsonWebTokenError'){
                //   return next(createError.Unauthorized())
                // }else{
                //     return next(createError.Unauthorized(err.message))
                // }
                const message = err.name === 'JsonWebTokenError' ? Unauthorized : err.message
                 return next(createError.Unauthorized(message))
            }
            req.payload = payload
            next()
        })
    },

    signRefreshToken: (userId) =>{
        return new Promise((resolve, reject) =>{
            const payload = {}
            const secret =process.env.REFRESH_TOKEN_SECRET
            const options ={
                expiresIn:"1y",
                issuer : "https://digitalpearls.site/?page_id=11",
                audience:userId
            }
            JWT.sign(payload, secret, options, (err, token) =>{
                if(err) {
                 console.log(err.message)
                  reject(createError.InternalServerError())
                }
                // store refresh token in redis
                client.SET(userId, token, 'EX', 365*24*60*60, (err, reply) =>{
                     if(err){
                         console.log(err.message)
                       reject(createError.InternalServerError())
                       return
                     }
                     resolve(token)
                })
            })
        })
     },
     verifyRefreshToken:(refreshToken) => {
         return new Promise((resolve, reject) => {
             JWT.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
                 if(err) return reject(createError.Unauthorized())
                 const userId = payload.aud

                 //get the refresh token stored in redis
                 //importance of redis: only a newly generated token will be able to
                 //generate a pair of access and refresh tokens to the user
                 client.GET(userId, (err, result) => {
                    if(err) {
                        console.log(err.message)
                        reject(createError.InternalServerError())
                        return
                    }
                    if(refreshToken === result) return resolve(userId)

                    reject(createError.Unauthorized())

                 })

                 resolve(userId)
             })
         })
     }
}








