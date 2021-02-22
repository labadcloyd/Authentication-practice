//jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/authenticationPractice', {useNewUrlParser:true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

app.listen(3000, ()=>{
    console.log('listening on port 3000');
})
app.get('/',(req,res)=>{
    res.render('home.ejs')
})
app.get('/register', (req,res)=>{
    res.render('register.ejs')
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})