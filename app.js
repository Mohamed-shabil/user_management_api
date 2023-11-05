const express = require('express')
const app = express();
const dotenv = require('dotenv');
const userRoute = require('./routes/userRoute')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
dotenv.config({path:'./config.env'})


app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use('/',userRoute)



module.exports = app;