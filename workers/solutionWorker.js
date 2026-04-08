import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";
import puppeteer from "puppeteer";
import * as Babel from '@babel/standalone';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Worker } from "bullmq";

// Convert ES module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validatorsDir = path.join(__dirname, "../validators");
const validators = {};
if (fs.existsSync(validatorsDir)) {
  const validatorFiles = fs.readdirSync(validatorsDir);
  for (const file of validatorFiles) {
    const challengeKey = path.basename(file, ".js"); // e.g., "challenge2Validator"
    validators[challengeKey] = (await import(`file://${path.join(validatorsDir, file)}`)).default;
  }
  console.log("Loaded validators:", Object.keys(validators));
} else {
  console.warn("Validators folder not found:", validatorsDir);
}

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

const worker = new Worker("solutions", async (job) => {
  const { solutionId, challengeId, iframeDoc } = job.data;

  // compile JSX → plain JS
  const compiledCode = Babel.transform(iframeDoc, { presets: ['react'] }).code;

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

  console.log(challengeId)

  // for other challenges
  try {
    console.log("validators::", validators);
    console.log("validators challengeId::", validators[challengeId]);
    if (validators[challengeId]) {
      isValid = await validators[challengeId](page); //eg. validateChallenge2(page)
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

worker.on('completed', (job, result) => {
  const { solutionId, result: status } = result

  // emit via socket
});

worker.on('failed', (job, err) => {
  console.log('Job failed:', err);
});
