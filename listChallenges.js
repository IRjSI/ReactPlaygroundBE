import { connectToDB } from "./db/config.js";
import dotenv from "dotenv";
import ChallengeModel from "./models/challenge.model.js";

dotenv.config();

connectToDB()
  .then(async () => {
    const challenges = await ChallengeModel.find();
    console.log(JSON.stringify(challenges, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
