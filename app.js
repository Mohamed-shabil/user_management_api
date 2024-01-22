const express = require('express')
const app = express();
const path = require('path');
const dotenv = require('dotenv');
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
const cors = require('cors')
const globalErrorHandler = require('./controller/errorController')
dotenv.config({path:'./config.env'})

app.use(cors({
    origin:['http://localhost:3000'],
    methods:['POST','GET','DELETE'],
    credentials:true
}))
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')));
app.use('/',userRoute)

app.use('/admin',adminRoute)
app.use(globalErrorHandler)



module.exports = app;