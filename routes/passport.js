var BnetStrategy = require('passport-bnet').Strategy;
require('dotenv').config();


module.exports = function(passport){
  passport.use(
    new BnetStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "https://localhost:3000/auth/bnet/callback",
        region: "us"
      }, function(accessToken, refreshToken, profile, done) {

          return done(null, profile);
      }));
}
