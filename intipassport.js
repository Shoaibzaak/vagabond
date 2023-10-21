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