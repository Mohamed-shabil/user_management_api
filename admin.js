const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./model/adminModel');
const dotenv = require('dotenv');
const asyncHandler = require('express-async-handler');
dotenv.config({path:'./config.env'});
const db = process.env.DATABASE

mongoose.connect(db,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    console.log('db Connected')
})

const seedAdmin = asyncHandler( async ()=>{
    const admin = process.env.ADMINUSERNAME
    const password = process.env.ADMINPASSWORD

    const hashedPassword = await bcrypt.hash(password,10);
    await Admin.create({
        name : admin,
        password : hashedPassword
    }).then(()=>{
        console.log('Admin created successfully');
        process.exit();
    }).catch(err=>{
        console.log(err)
        process.exit(1);
    })
})

seedAdmin();