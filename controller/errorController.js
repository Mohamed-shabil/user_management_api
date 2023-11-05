const AppError = require('../utils/appError');

const handleCastError = err =>{
    const message = `invalid ${err.path} : ${err.value}`
    return new AppError(message,400);
}

const handleDuplicateFieldsDB = err =>{
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