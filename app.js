const express = require('express')
const app = express()
const expressLayouts =  require('express-ejs-layouts')
const indexrouter = require('./routes/index')
const authorrouter = require('./routes/authors')
const bookrouter = require('./routes/books')
require('dotenv').config({path : "./config.env"})
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

app.set('view engine','ejs')
app.set('views',__dirname + '/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.urlencoded({limit : "10mb",extended:false}))
app.use(methodOverride('_method'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE,{useNewUrlParser : true,useUnifiedTopology : true})

const db = mongoose.connection

db.on('error',error => console.error(error))

db.once('open',()=>{console.log("db is connected")})


app.use('/',indexrouter)
app.use('/authors',authorrouter)
app.use('/books',bookrouter)


app.listen(process.env.PORT || 3000)