const express = require('express')
const app = express()
const expressLayouts =  require('express-ejs-layouts')
const { patch } = require('./routes/index')
const indexrouter = require('./routes/index')
const dotenv = require('dotenv').config({path : "./config.env"})

app.set('view engine','ejs')
app.set('views',__dirname + '/views')
app.set('layout','layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE,{useNewUrlParser : true})

const db = mongoose.connection

db.on('error',error => console.error(error))

db.once('open',()=>{console.log("db is connected")})


app.use('/',indexrouter)


app.listen(process.env.PORT || 3000)