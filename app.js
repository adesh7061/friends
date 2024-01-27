//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt=require("mongoose-encryption")
const md5=require("md5");
const bcrypt=require("bcrypt");
const saltRounds=10; 
let alert = require('alert'); 




const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate =require('mongoose-findorcreate')

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret:"Our Little Secret",
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://sinhaadesh123:hCZsZM1rk2ofpUOs@cluster0.0ruv3vz.mongodb.net/");
const secretSchema = new mongoose.Schema({
  Friend:{
      type: String,
      required: true,
    },
 
});
const notification = new mongoose.Schema({
     To: String,
     From: String,
     
})

const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  Friends:[secretSchema]
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User=new mongoose.model("User",userSchema);
 const Friends=new mongoose.model("Friends",secretSchema);
 const Notification=new mongoose.model("Notification",notification);

 passport.use(User.createStrategy());
 passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture
    });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


app.get("/",function(req,res)
{
      res.render("start");
})
app.get("/register",function(req,res)
{
      res.render("register");
})
app.post("/register",function(req,res)
{ 
  // const newUser =new User ({
  //       username: req.body.username,
  //       password: req.body.password
  //     });
  //     newUser.save();
  //     res.redirect("/start");
      User.register({username:req.body.username},req.body.password,function(err,user){
        if(err)
        {
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req,res,async function(){
                 res.redirect("/home");
            });
        }
    });

});
app.get("/home",async function(req,res)
{
  const deto=[];
 if( req.isAuthenticated())
 {
      const user=await User.find({username:req.user.username}).exec();
        for(let i=0;i<user[0].Friends.length;i++)
        {
            deto.push(user[0].Friends[i].Friend);
        }
        const not=await Notification.find({To:req.user.username}).exec();
        console.log(not);
        
  res.render("home",{noti:deto , nota:not});
 }
else
{
  res.redirect("/login");
}
})
app.get("/logout",function(req,res)
{
    req.logout(function(err)
    {
        if(err)
        {
            console.log(err);
        }
        else
        {
            res.redirect("/");
        }
    });
   // res.redirect("/");
})
app.post("/login",async function(req,res)
{
          // const user=await User.find({username:req.body.username}).exec();
          // console.log(user[0].password);
          // console.log(req.body.username);

          //     if(user[0].username == null)
          //    {
          //     res.send("Wrong Username");
          //    }
          //    else
          //    {
          //          if(user[0].password == req.body.password)
          //          {
          //              res.redirect("/home");
          //          }
          //          else
          //          {
          //           res.send("Wrong Password");
          //          }
          //    }
             const user=new User({
              username: req.body.username,
              password: req.body.password
          })
          req.login(user,function(err)
          {
              if(err)
              {
                  console.log(err);
              }
              else
              {
                      passport.authenticate("local")(req,res,function(){
                          res.redirect("/home");
                      })
      
              }
          })
             
            
});
const de=[];
  
app.get("/notification",async function(req,res)
{
 
  while (de.length > 0) {
    de.pop();
  }
  const noti=await Notification.find({To:req.user.username}).exec();
      
     for(let i=0;i<noti.length;i++)
     {
      //console.log(noti[i].From);
          de.push(noti[i].From);
     }
     res.render("Notification",{notification:de});
     
    
})
app.post("/notification",async function(req,res)
{
      if(req.body.foo[0] == 'A')
     {
    let a=req.body.foo.length
    const user = await User.findById(req.user.id);
         const del= req.body.foo.substring(1,a);
         const ne=new Friends({
          Friend:del
      })

      user.Friends.push(ne);
      user.save();
      Notification.deleteOne({From:del}).then(function(){
        console.log("Data deleted"); // Success
    }).catch(function(error){
        console.log(error); // Failure
    });
    res.redirect("/home");
         
         
     }
     else
     {
      let a=req.body.foo.length
      const del= req.body.foo.substring(1,a);
      Notification.deleteOne({From:del}).then(function(){
        console.log("Data deleted"); // Success
    }).catch(function(error){
        console.log(error); // Failure
    });
    res.redirect("/home");
     }
       
});

app.post("/delete",function(req,res)
{
  User.findOne({username:req.user.username}).then(function(user) {
    user.Friends.pull({ Friend: req.body.fufu });
    user.save().then(function(user) {
      res.redirect("/home");
    });
  });
 
})
app.post("/home",function(req,res)
{
  const notification =new Notification ({
       To: req.body.email,
       From: req.user.username,
       
  });
  notification.save();

         res.redirect("/home");
       
})


app.get("/login",function(req,res)
{
      res.render("login");
      
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
//VAgkYiZH4E614Cvm
//hCZsZM1rk2ofpUOs
