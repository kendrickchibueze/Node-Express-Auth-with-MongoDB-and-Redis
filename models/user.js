const mongoose = require('mongoose');
const Schema = mongoose.Schema
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    email :{
        type: String,
        required: true,
        lowercase:true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    }
})
//we want to fire a middleware before we save a user
//Because of this keyword, we will use a normal function and not an arrow function
//We have pre and post...they are mongoose middleware
userSchema.pre('save', async function (next){
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
         this.password = hashedPassword
         next()
    } catch (error) {
        next(error);

    }

})
userSchema.methods.isValidPassword = async function(password){
    try {
         return await bcrypt.compare(password, this.password)

    } catch (error) {
        throw error

    }
}

module.exports = mongoose.model('User',userSchema)