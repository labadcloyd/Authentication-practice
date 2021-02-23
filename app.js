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

const userSchema = new mongoose.Schema({
    username:String,
    password:String
})
const user = mongoose.model('user',userSchema)

app.listen(3000, ()=>{
    console.log('listening on port 3000');
})
app.get('/',(req,res)=>{
    res.render('home.ejs')
})
app.get('/register', (req,res)=>{
    res.render('register.ejs')
})
app.post('/register',(req,res)=>{
    let newUser = new user({
        username: req.body.username,
        password: req.body.password
    })
    newUser.save((err)=>{
        if(err){
            res.send(err)
        }else{
            res.render('secrets.ejs')
        }
    });
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.post('/login',(req,res)=>{
    user.findOne({username:req.body.username},(err, foundUser)=>{
        if(err){
            res.send(err)
        }
        else if(foundUser){
            if(foundUser.password===req.body.password){
                res.render('secrets.ejs')
            }
            else{
                res.send("no found user")
            }
        }
    })
})