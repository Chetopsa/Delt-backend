const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('./models'); // Adjust the import based on your project structure
const {secrets} = require('./google_keys.json')

passport.use(new GoogleStrategy({
  clientID: secrets.client_id, // Replace with your Google client ID
  clientSecret: secrets.client_secret, // Replace with your Google client secret
  callbackURL: 'http://localhost:5001/auth/google/callback' // needs to be updated (maybe not) ps it did fml
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // handles logic for adding users to Database
    let email = profile.emails[0].value
    // console.log(profile);
    // Find or create user in your database
    let user = await User.findOne({ where: { googleID: email} });
    if (!user) {
      user = await User.create({
        googleID: email,
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Serialize user information into the session
passport.serializeUser((user, done) => {
  done(null, user.userID);
});

// Deserialize user information from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
