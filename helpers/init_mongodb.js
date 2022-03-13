const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true

})
   .then(() =>{
       console.log(':::mongodb connected...')
   })
   .catch((err) =>{console.log(err.message)});

   mongoose.connection.on('connected', () =>{
       console.log('Mongoose connected to db')
   })
   mongoose.connection.on('error', () =>{
    console.log(err.message)
})
mongoose.connection.on('disconnected', () =>{
    console.log('Mongoose connection is disconnected..')
})

//when you press ctrl c to stop your server, this runs
process.on('SIGINT', async () =>{
    await mongoose.connection.close()
    process.exit

})