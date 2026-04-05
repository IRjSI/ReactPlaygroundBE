import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/user.model.js";
import { configDotenv } from "dotenv";

configDotenv();

console.log(process.env.GOOGLE_CALLBACK_URL)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "dev" ? "http://localhost:4000/api/v1/auth/google/callback" : `${process.env.GOOGLE_CALLBACK_URL}`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            username: profile.displayName,
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
