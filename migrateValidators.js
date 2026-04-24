import fs from "fs";
import path from "path";
import { connectToDB } from "./db/config.js";
import ChallengeModel from "./models/challenge.model.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

connectToDB()
  .then(async () => {
    const validatorsDir = path.join(__dirname, "validators");
    const challenges = await ChallengeModel.find();

    for (const challenge of challenges) {
      const match = challenge.statement.match(/^Challenge (\d+):/);
      if (match) {
        const num = match[1];
        const validatorFile = path.join(validatorsDir, `challenge${num}Validator.js`);
        if (fs.existsSync(validatorFile)) {
          const content = fs.readFileSync(validatorFile, "utf-8");
          
          const firstBrace = content.indexOf('{');
          const lastBrace = content.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1) {
            const body = content.substring(firstBrace + 1, lastBrace).trim();
            challenge.validatorCode = body;
            await challenge.save();
            console.log(`Migrated challenge ${num}`);
          }
        } else {
            console.log(`Validator file not found for challenge ${num}`);
        }
      }
    }
    console.log("Migration complete");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
