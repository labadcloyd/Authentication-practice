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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')

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

let mongoServerPassword = process.env.MONGODB_URL
mongoose.connect(process.env.MONGODB_URL||'mongodb+srv://admin-cloyd:'+mongoServerPassword+'@todo-app.0pmsv.mongodb.net/secretsDB?retryWrites=true&w=majority', {useNewUrlParser:true, useUnifiedTopology: true })
mongoose.set('useFindAndModify', false);

const UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    googleId:String,
    secret: [String]
});
UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

const User = new mongoose.model('user', UserSchema);
passport.use(User.createStrategy());


passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/secrets',
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

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
      User.find({secret:{$ne:null}},(err,founduser)=>{
        if(err){
          console.log(err)
        }else{
          if(founduser){
            res.render('secrets.ejs',{
              secretuser:founduser
            })
          }
        }
      })
    }else{
        res.redirect('/login')
    }
})
app.get('/submit',(req,res)=>{
  if(req.isAuthenticated()){
    res.render('submit.ejs')
  }else{
    res.redirect('/login')
}
})
app.get('/logout', (req,res)=>{
    req.logout();
    res.redirect('/')
})
app.get('/auth/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

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
app.post('/submit',(req,res)=>{
  let submittedSecret = req.body.secret;
  User.findById(req.user.id,(err,founduser)=>{
    if(err){
      console.log(err)
      res.redirect('/')
    }else {
      if(founduser){
        founduser.secret.push(submittedSecret);
        founduser.save();
        res.redirect('/secrets')
      }
    }
  })
})