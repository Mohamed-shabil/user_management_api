const asyncHandler = require('express-async-handler');
const Admin = require('../model/adminModel');
const User = require('../model/userModel')
const {promisify} = require('util')
const AppError = require('../utils/appError');
const multer = require('multer')
const sharp = require('sharp')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');




const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Not an image !, Please upload only Images',400),false)
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter : multerFilter
})

exports.uploadUserProfile = upload.single('profile')

exports.resizeUserProfile = asyncHandler(async(req,res,next)=>{
    if(!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    req.body.profile = req.file.filename
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90}).toFile(`public/profile/${req.file.filename}`);
    next();
});





const signToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id)
    const cookieOptions ={
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        withCredentials: true,
    }
    user.password = undefined
    res.cookie('jwt',token,cookieOptions)
    res.status(statusCode).json({
        status:'success',
        data:user
    })
}


exports.login  = asyncHandler(async(req,res,next)=>{
    const {name,password} = req.body;
    if(!name||!password){
        return next(new AppError('please provide username and password',400));
    }
    const admin = await Admin.findOne({name})
    if(!admin){
        return next(new AppError('incorrect username or password',400));
    }
    const checkPass = await bcrypt.compare(password,admin.password);
    if(!checkPass){
        return next(new AppError('incorrect username or password',400));
    }
    req.user = admin
    createSendToken(admin,200,res)
})


exports.getAllUsers = asyncHandler(async(req,res)=>{
    const query = {}
    if(req.params.search){
        query.name = req.params.search
    }
    const users = await User.find(query);
    console.log(users)
    return res.status(200).json({
        status:"success",
        data:users
    })
})
exports.createUser = asyncHandler(async(req,res)=>{
    console.log(req.body)
    const data = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword
    }
    const newUser = await User.create(data)
    
    res.status(200).json({
        status:"success",
        data:newUser
    })
})

exports.getEditUser = asyncHandler(async(req,res,next)=>{
    console.log('im here')
    const user = await User.findById({_id:req.params.id});
    if(!user){
        return next(new AppError('No user found on this id',404));
    }
    res.status(200).json({
        status:"success",
        data:user
    })
})

exports.editUser = asyncHandler(async(req,res,next)=>{
    const updatedData = {
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone
    }
    if(req.body.profile){
        updatedData.profile = req.body.profile
    }
    const updatedUser = await User.findOneAndUpdate({_id:req.params.id},updatedData)
    if(!updatedUser){
        return next(new AppError('Something went Wrong Try again!',404));
    }
    res.status(200).json({
        status:"success",
        data:updatedUser
    })
})

exports.deleteUser = asyncHandler(async(req, res,next)=> {
    console.log(req.params.id)
    const deletedUser = await User.findOneAndDelete({_id:req.params.id})
    console.log(deletedUser)
    if(!deletedUser){
        return next(new AppError('Something went wrong',400));
    }
    res.status(200).json({
        status:'success',
        data:null
    })
})

exports.protect = asyncHandler(async(req,res,next)=>{
    console.log('im reaching here')
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        token = req.headers.authorization.split(' ')[1];
        console.log('token ',token)
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    
    if(!token){
        return next(new AppError("You are not logged in ! Please Login to get Access",401))
    };
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const currentUser = await Admin.findById(decode.id)
    if(!currentUser){
        return next( new AppError("The user belonging to this token is does no longer exist.",404))
    }
    req.user = currentUser;
    console.log(req.user);
    next();
})

exports.isLoggedIn = asyncHandler(async(req,res,next)=>{
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        // token = req.header.autherization.split(' ')[1]
        token = req.headers.authorization.split(' ')[1];
        console.log('token ',token)
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const currentUser = await User.findById(decode.id)
    if(!currentUser){
        return next();
    }
    
})

exports.logout = asyncHandler(async (req, res, next )=>{
    res.cookie('jwt','loggedout',{
      expires : new Date(Date.now() + 10 * 10000),
      httpOnly:true
    });
    res.status(200).json({
      status:'success'
    })
})

