const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'please tell us your name']
    },
    email:{
        type: String,
        required: [true,'provide your email'],
        unique:true
    },
    phone:{
        type: Number,
        required: [true,'provide your phone number']
    },
    password:{
        type: String,
        required:true,
        select:false

    },
    profile:{
        type: String,
        default:'user.png'
    }
})


userSchema.pre('save',async function(next){
    this.password = await bcrypt.hash(this.password,12)
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword,userPassword){
    return await bcrypt.compare(candidatePassword,userPassword)
}

const User = mongoose.model('User',userSchema);
module.exports = User;