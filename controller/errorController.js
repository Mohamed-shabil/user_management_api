const AppError = require('../utils/appError');

const handleCastError = err =>{
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message,400);
}

const handleDuplicateFields = err =>{
    const value = err.keyValue.match(/(["'])(\\?.)*?\1/);
    const message = `Duplicate Field Value: " ${Object.values(value)} " Please try another values`
    return new AppError(message,400)
}

const handleJWTError = err => {
    return new AppError('invalid Token ',400);
}

const handleJWTExpiredError = err =>{
    return new AppError('Your Token is expired ! Please login again',401)
}

const sendErrorDev = (err,req,res) => {
    //A -  API
    console.log(req.originalUrl);
  
    if(req.originalUrl.startsWith('/')){
        return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
      });
    }
    // B RENDERED WEBSITE 
  
    console.error('Error 🔥', err);
     // A Operational, trusted error : send message to client 
     return res.status(err.statusCode).render('error',{
        title:'Something Went Wrong !',
        msg: err.message
      })
  };


  module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
        console.log(err)
      let error = { ...err };
      error.message = err.message; 
  
      // Cast Error Controller handleCastErrorDB-> Related to DB / handleCastErrorDB is assigned to the middleware err
      if(err.name === 'CastError') error = handleCastError(error);
      if(error.code === 11000) error = handleDuplicateFields(error);
      if(err.name === 'JsonWebTokenError') error = handleJWTError(error);
      if(err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
  
      sendErrorDev(err,req,res);
    
  };