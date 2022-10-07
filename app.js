//jshint esversion:6

const path = require("path");
const http = require("http"); 
const socketIO = require("socket.io");
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser, userLeave, getRoomUser} = require("./utils/users");

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

// google oauth20
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { json } = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

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

mongoose.connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true
});

const Schema = new mongoose.Schema({
    username: String,
    password: String,
    googleId: String
});

Schema.plugin(passportLocalMongoose);
Schema.plugin(findOrCreate);

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


// Run when client connects
io.on('connection', socket=>{
    socket.on('joinRoom', ({username,room})=>{

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage('Chatbot','Welcome to Chat App!'));     // message to user
        socket.broadcast.to(user.room).emit('message', formatMessage('Chatbot',`${user.username} joined the chat`));

        // Send users and room information
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
    })


    //Listen for chat Message
    socket.on('chatMessage', msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username, msg));
    });


    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message',formatMessage('Chatbot', `${user.username} has left the chat.`));     // message to everybody    
        }
        // Send users and room information
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
    
    });
});

// oauth2.0
passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALL_BACK_URL,
    passReqToCallback   : true,
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id, username:profile.emails[0].value }, function (err, user) {
      return done(err, user);
    });
  }
));


app.get("/", function(req,res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));


app.get( "/auth/google/secrets",
    passport.authenticate( 'google', {
        successRedirect: '/secrets',
        failureRedirect: '/'
}));

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

server.listen( process.env.PORT || 8000, function(){
	console.log("server is started on port 8000");
});