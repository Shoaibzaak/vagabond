var passport=require("passport")
var GoogleStrategy=require("passport-google-oauth20")
var google=require('./passportconfig')
const session=require("express-session")
 const initPassport = (app) => {
  //init's the app session
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: "shoa@12",
    })
  );
  //init passport
  app.use(passport.initialize());
  app.use(passport.session());
};


////////// GOOGLE //////////
passport.use(
  new GoogleStrategy(
    google,
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      //done(err, user) will return the user we got from fb
      done(null, formatGoogle(profile._json));
    }
  )
);

////////// Serialize/Deserialize //////////

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));

////////// Format data//////////

const formatGoogle = (profile) => {
  return {
    fullName:profile.fullName,
    email: profile.emaiL
  };
};
module.exports=initPassport

// const passport  = require('passport');

// require('dotenv').config();

// const GoogleStrategy = require('passport-google-oauth2').Strategy;

// // used to serialize the user for the session
// passport.serializeUser(function (user, done) {
//     done(null, user);
// });

// // used to deserialize the user
// passport.deserializeUser(function (user, done) {
//         done(null, user);
// });

// //Google strategy
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/api/auth/user/login/google/callback",
//     passReqToCallback: true
// }, (request, accessToken, refreshToken, profile, done) => {
//     console.log(profile)
//     done(null, profile)
// }));