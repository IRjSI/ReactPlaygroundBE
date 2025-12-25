import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://reactplaygroundbe-production.up.railway.app/api/v1/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            avatar: profile.photos[0].value,
            provider: "google",
            providerId: profile.id,
            password: null // important
          });
        } else if (!user.providerId) {
          // Link Google if previously registered via email-password
          user.provider = "google";
          user.providerId = profile.id;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
