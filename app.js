//jshint esversion:6

const path = require("path");
require('dotenv').config();
const express = require("express");
const bodyParser= require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
//const md5 = require("md5");
// const bcrypt= require("bcrypt");
// const saltRounds = 5;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// Set static folder
app.use(express.static(path.join(__dirname, "/public")));


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "A long text might be anything.",
    resave:false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
    useNewUrlParser: true
});

const Schema = new mongoose.Schema({
    username: String,
    password: String
});

Schema.plugin(passportLocalMongoose);

const User = mongoose.model("User", Schema);

passport.use(User.createStrategy());
passport.serializeUser(function(user, done){
    done(null, user.id);
});
passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});

app.get("/", function(req,res){
    res.render("home");
});

app.get("/chat-anynomous", function(req,res){
    res.render("chat-anynomous");
});

app.get("/anynomous", function(req,res){
    res.render("anynomous");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/logout", function(req,res){
    req.logout(function(err){
        if(!err){
            res.redirect("/");
        }else{
            console.log(err);
            res.redirect("/");
        }
    });
});

app.post("/register", function(req, res){
    // const newUser = new User({
    //     usernname: req.body.username,
    //     password: md5(req.body.password)
    // });
    // User.findOne({username: req.body.username}, function(err, found){
    //     if(found){
    //         res.send("Email already registered. Please Login.");
    //     }else{
    //         newUser.save(function(err){
    //             if(!err){
    //                 res.render("secrets");
    //             }else{
    //                 res.send("Please Try Again. User couldn't be created.");
    //             }
    //         });
    //     }
    // })
    
    User.register({username: req.body.username}, req.body.password, function(err, User){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req, res, function(){
                    res.redirect("/secrets");
                });
            }
        });
});

app.post("/login", function(req,res){
    
    // User.findOne({username: req.body.username}, function(err, foundUser){
    //     if(err){
    //         res.send(err);
    //     }else if (foundUser){
    //         if (foundUser.password === md5(req.body.password)){
    //             res.render("secrets");
    //         }else{
    //         res.send("Password donot match!");
    //         }
    //     }else{
    //         res.send("This User isn't registered with us. Please Register first.");
    //     }
    // });

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(8000, function(){
	console.log("server is started on port 8000");
});