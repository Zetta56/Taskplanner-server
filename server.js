require("dotenv").config();

//Packages
const express = require("express"),
	  app = express(),
	  cors = require("cors"),
	  bodyParser = require("body-parser"),
	  cookieParser = require("cookie-parser"),
	  jwt = require("jsonwebtoken"),
	  mongoose = require("mongoose"),
	  passport = require("passport"),
	  LocalStrategy = require("passport-local"),
	  JwtStrategy = require("passport-jwt"),
	  passportLocalMongoose = require("passport-local-mongoose");

//Models
const User = require("./models/User");
const Token = require("./models/Token");

//Routes
const indexRoutes = require("./routes/index");

//DB Config
mongoose.connect(process.env.DATABASEURL || "mongodb://localhost/taskplanner", {useNewUrlParser: true, useUnifiedTopology: true});

//App Config
app.use(cors({credentials: true, origin: true}));	//Enables cookies in cross-origin request
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Authentication Config
app.use(passport.initialize());
passport.use(new JwtStrategy.Strategy({
	jwtFromRequest: (req) => {		//Extracts JWT from cookies
		let token = null;
		if(req && req.cookies) {
			token = req.cookies["access_token"];
		};
		return token;
	},
	secretOrKey: process.env.ACCESS_KEY
}, (payload, done) => {
    User.findOne({_id: payload.sub}, (err, user) => {		//Finds and returns user on successful JWT authentication
        if(err) {
            return done(err, false);
        };
        if(!user) {
        	return done(null, false);
        };
        return done(null, user);
    });
}));
passport.use(new LocalStrategy(User.authenticate()));	//Uses passportLocalMongoose's authenticate method
 
//Run Routes
app.use("/", indexRoutes);

//Start Server
app.listen(process.env.PORT || 3001, () => {
	console.log("Server Started");
});