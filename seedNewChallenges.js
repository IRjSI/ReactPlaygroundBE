import { connectToDB } from "./db/config.js";
import dotenv from "dotenv";
import ChallengeModel from "./models/challenge.model.js";

dotenv.config();

const newChallenges = [
  {
    statement: "Challenge 13: Create a password input field and a 'Toggle' button. Clicking the button toggles the input's type between 'password' and 'text'.",
    difficulty: "medium"
  },
  {
    statement: "Challenge 14: Create a select dropdown with options 'Red', 'Green', 'Blue'. Display 'Selected: [Color]' in a span tag when an option is chosen.",
    difficulty: "medium"
  },
  {
    statement: "Challenge 15: Create two buttons '+' and '-' to increment and decrement a number starting at 0 displayed in a span.",
    difficulty: "easy"
  },
  {
    statement: "Challenge 16: Create a text input and an 'Add' button. Clicking 'Add' adds the text to an unordered list (ul) and clears the input.",
    difficulty: "hard"
  },
  {
    statement: "Challenge 17: Create a div with text 'Hover me'. On mouseEnter, change text to 'Hovered!'. On mouseLeave, change back to 'Hover me'.",
    difficulty: "medium"
  },
  {
    statement: "Challenge 18: Create an input field. As the user types, display the reversed text in a p tag.",
    difficulty: "hard"
  },
  {
    statement: "Challenge 19: Create two text inputs (First Name, Last Name). Display the full name dynamically in a span tag.",
    difficulty: "easy"
  },
  {
    statement: "Challenge 20: Create a checkbox 'Subscribe'. When checked, show a button 'Submit'. When unchecked, the button should not be present in the DOM.",
    difficulty: "medium"
  }
];

connectToDB()
  .then(async () => {
    for (const challenge of newChallenges) {
      // Check if exists
      const exists = await ChallengeModel.findOne({ statement: challenge.statement });
      if (!exists) {
        await ChallengeModel.create(challenge);
        console.log("Created:", challenge.statement);
      } else {
        console.log("Already exists:", challenge.statement);
      }
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
