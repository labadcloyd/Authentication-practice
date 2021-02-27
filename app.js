//jshint esversion:6
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { urlencoded } = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }))

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect('mongodb://localhost:27017/authenticationPractice', {useNewUrlParser:true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

const UserSchema = new mongoose.Schema({
    username:String,
    password:String
});
UserSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('user', UserSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(process.env.PORT || 3000, ()=>{
    console.log('listening on port 3000');
});
app.get('/',(req,res)=>{
    res.render('home.ejs')
});
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})
app.get('/register', (req,res)=>{
    res.render('register.ejs')
});
app.get('/secrets', (req,res)=>{
    if(req.isAuthenticated()){
        res.render('secrets.ejs')
    }else{
        res.redirect('/login')
    }
});
app.get('/logout', (req,res)=>{
    req.logout();
    res.redirect('/')
})

app.post('/register',(req,res)=>{
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err){
            console.log(err);
            res.redirect('/register')
        }else{
            passport.authenticate('local')(req,res, ()=>{
                res.redirect('/secrets');
            });
        }
    });
});
app.post('/login',(req,res)=>{
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, (err)=>{
        if(err){
            console.log(err)
            res.redirect('/login')
        }else{
            passport.authenticate('local')(req,res, ()=>{
                res.redirect('/secrets');
            });
        }
    })
})