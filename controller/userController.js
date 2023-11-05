const asyncHandler = require('express-async-handler')
const AppError = require('../utils/appError')
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')

exports.home = (req,res)=>{
   res.status(200).json({
    status:'success',
    message: req.user
   })
}

const signToken = (id)=>{
    console.log(process.env.JWT_EXPIRES_IN)
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_IN
    })
}

const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user.id)
    const cookieOptions ={
        expires:new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        )
    }
    user.password = undefined
    res.cookie('jwt',token,cookieOptions);
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user,
        }
    })
}

exports.signup = asyncHandler(async(req,res,next)=>{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    })
    newUser.password = undefined
    newUser._id = undefined
    res.status(200).json({
        status:'success',
        data:newUser
    })
    createSendToken(newUser,201,res);
})

exports.login = asyncHandler(async(req,res,next)=>{
    const {email,password}  = req.body
    if(!email || !password){
        return next(new AppError('please provide email and password to login!',400))
    }
    const user = await User.findOne({email}).select('+password');

    if(!user|| !(await user.correctPassword(password,user.password))){
        return next(new AppError('Incorrect username and password',401))
    }
    req.user = user
    createSendToken(user,200,res)
})

exports.protect = asyncHandler(async(req,res,next)=>{
    let token;
    if(
        req.header.autherization && 
        req.header.autherization.startsWith("Bearer")
    ){
        token = req.header.autherization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }

    if(!token){
        return next(AppError("You are not logged in ! Please Login to get Access",401))
    };
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    const currentUser = await User.findById({_id:decode.id})
    console.log(currentUser);
    if(!currentUser){
        return next( new AppError("The user belonging to this token is does no longer exist.",404))
    }
    req.user = currentUser;
    next();
})