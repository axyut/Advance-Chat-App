//jshint esversion:6

const path = require("path");
const http = require("http");

require("dotenv").config();
const express = require("express");
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");

//const md5 = require("md5");
// const bcrypt= require("bcrypt");
// const saltRounds = 5;
const session = require("express-session");
const passport = require("passport");

// google oauth20
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { json } = require("body-parser");

const User = require("./models/user");
const connectDB = require("./database/connection");
const RootRouter = require("./routes/RootRoute");

// Set static folder
app.use(express.static(path.join(__dirname, "/public")));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

const socketIO = require("socket.io");
const io = socketIO(server);

const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUser,
} = require("./utils/users");

app.use(
	session({
		secret: "A long text might be anything.",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

// Run when client connects to anonymous chat app
io.on("connection", (socket) => {
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);
		socket.join(user.room);

		socket.emit(
			"message",
			formatMessage("Chatbot", "Welcome to Chat App!")
		); // message to user
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage("Chatbot", `${user.username} joined the chat`)
			);

		// Send users and room information
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUser(user.room),
		});
	});

	//Listen for chat Message
	socket.on("chatMessage", (msg) => {
		const user = getCurrentUser(socket.id);
		io.to(user.room).emit("message", formatMessage(user.username, msg));
	});

	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage("Chatbot", `${user.username} has left the chat.`)
			); // message to everybody
		}
		// Send users and room information
		io.to(user.room).emit("roomUsers", {
			room: user.room,
			users: getRoomUser(user.room),
		});
	});
});

// oauth2.0
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALL_BACK_URL,
			passReqToCallback: true,
			userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		},
		function (request, accessToken, refreshToken, profile, done) {
			User.findOrCreate(
				{ googleId: profile.id, username: profile.emails[0].value },
				function (err, user) {
					return done(err, user);
				}
			);
		}
	)
);

app.use("", RootRouter);

const PORT = process.env.PORT;
connectDB().then(() => {
	server.listen(PORT, function () {
		console.log(`Server is running at http://localhost:${PORT}`);
	});
});
