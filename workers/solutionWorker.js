import dotenv from "dotenv";
dotenv.config();

import puppeteer from "puppeteer";
import * as Babel from '@babel/standalone';
import { Worker } from "bullmq";
import ChallengeModel from "../models/challenge.model.js";
import { connectToDB } from "../db/config.js";

// Connect to MongoDB
connectToDB();

// AsyncFunction constructor for dynamic code execution
const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;


async function launchBrowser() {
  try {
    console.log('Launching Puppeteer browser...');

    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions'
      ],
    };

    // Only use custom executablePath if explicitly set in .env
    // Otherwise, let Puppeteer use its bundled Chromium
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    console.log('✅ Puppeteer browser launched successfully');
    return browser;

  } catch (err) {
    console.error('❌ Failed to launch Puppeteer:', err.message);
    throw err;
  }
}

// BullMQ Worker

const browser = await launchBrowser()

console.log("WORKER CREATED");

export const worker = new Worker("solutions", async (job) => {
  const { solutionId, iframeDoc, challengeId, userId } = job.data;

  // compile JSX → plain JS
  let compiledCode = "";
  try {
    compiledCode = Babel.transform(iframeDoc, { presets: ['react'] }).code;
  } catch (err) {
    console.error("Babel transform error:", err.message);
    return {
      solutionId,
      challengeId,
      userId,
      result: "invalid"
    };
  }

  // create HTML scaffold to run the React app
  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script crossorigin src="https://unpkg.com/react@17/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
        <script>
          try {
            ${compiledCode}
            ReactDOM.render(React.createElement(App), document.getElementById('root'));
          } catch (err) {
            document.body.innerHTML = '<pre>' + err + '</pre>';
          }
        </script>
      </body>
    </html>
  `;

  console.log('Checking browser paths...');
  console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);

  // launch headless browser
  const page = await browser.newPage();
  console.log("setup done")

  // set HTML content
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  let isValid = false;

  // HARDCODED FOR TESTING
  // const challengeId = "challenge2Validator";

  console.log("reached validity check")

  // for other challenges
  try {
    const validator = await ChallengeModel.findById(challengeId).select("validatorCode");

    if (validator && validator.validatorCode) {
      const validateFn = new AsyncFunction("page", validator.validatorCode);
      isValid = await validateFn(page);
      console.log("isValid:", isValid);
    } else {
      console.warn(`No validator found for ${challengeId}, marking invalid`);
    }


  } catch (err) {
    console.error("Validator error:", err.message);
  }

  console.log("browser closing")
  await page.close();
  console.log("browser closed")

  return {
    solutionId,
    challengeId,
    userId,
    result: isValid ? "valid" : "invalid"
  };
}, {
  connection: {
    url: process.env.REDIS_URL,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  }
})
