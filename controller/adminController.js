const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');




exports.getAllUsers = asyncHandler(async(req,res)=>{
    const query = {}
    if(req.params.search){
        query.name = req.params.search
    }
    const users = await User.find(query);
    res.status(200).json({
        status:"success",
        data:users
    })
})

exports.createUser = asyncHandler(async(req,res)=>{
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
    const user = User.findById({_id:req.params.id});
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
    const deletedUser = await User.findOneAndDelete({_id:req.body.id})
    if(!deletedUser){
        return next(new AppError('Something went wrong',400));
    }
    res.status(200).json({
        status:'success',
        data:null
    })
})