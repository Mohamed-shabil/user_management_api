const mongoose = require('mongoose');
const app = require('./app');


const db = process.env.DATABASE
console.log(db)

mongoose.connect(db,{
  useNewUrlParser:true,
  useUnifiedTopology: true
}).then(()=>{
  console.log('db connection established')
})


app.listen(5000,()=>{
    console.log('listening on  port 3000')
})