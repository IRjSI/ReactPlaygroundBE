import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";
import puppeteer from "puppeteer";
import * as Babel from '@babel/standalone';

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
const subscriber = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});
redis.on("connect", () => console.log("Connected to Redis!"));
redis.on("ready", () => console.log("Redis ready!"));
subscriber.on("connect", () => console.log("Connected to subscriber!"));
subscriber.on("ready", () => console.log("subscriber ready!"));


await subscriber.connect();
await redis.connect();

await subscriber.subscribe("solution_channel", async (message) => {
  const { solutionId } = JSON.parse(message);
  console.log("Processing solution:", solutionId);
  
  // Get the specific solution data
  const solutionData = await redis.get(`solution:${solutionId}`);
  if (!solutionData) return;
  
  await redis.del(`solution:${solutionId}`); // Clean up
  
  const { iframeDoc } = JSON.parse(solutionData);

  // Compile JSX → plain JS
  const compiledCode = Babel.transform(iframeDoc, { presets: ['react'] }).code;

  // Create HTML scaffold to run the React app
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

  // Launch headless browser

  console.log('Checking browser paths...');
  console.log('PLAYWRIGHT_BROWSERS_PATH:', process.env.PLAYWRIGHT_BROWSERS_PATH);

  const browser = await launchBrowser()

  const page = await browser.newPage();
  console.log("setup done")

  // Set HTML content
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  let isValid = false;

  console.log("reached validity check")

  try {
    // Wait for the button to appear
    const button = await page.waitForSelector("button", { timeout: 2000 });

    // Get initial text
    const beforeText = await page.evaluate(el => el.textContent?.toLowerCase().trim(), button);

    // Click button
    await button.click();

    // Wait a small delay to allow React to update state
    // await page.waitForTimeout(100);

    // Get updated text
    const afterText = await page.evaluate(el => el.textContent?.toLowerCase().trim(), button);

    isValid = beforeText !== afterText && afterText === "click";

  } catch (err) {
    console.error("Validation error:", err.message);
  }

  console.log("browser closing")
  await browser.close();
  console.log("browser closed")

  // Publish result back to Redis
  await redis.publish("results_channel", JSON.stringify({
    solutionId,
    result: isValid ? "valid" : "invalid"
  }));

  console.log("done checking")
});
