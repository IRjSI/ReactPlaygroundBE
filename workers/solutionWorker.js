import { createClient } from "redis";
import { chromium } from "playwright";
import * as Babel from '@babel/standalone';

import fs from 'fs';
import path from 'path';

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
  console.log("reached solution worker with:: ", solutionId)
  
  // Pop user submission from queue
  const solutionData = await redis.lPop("solutions_queue");
  if (!solutionData) return;
  console.log("popped the data from queue") // mostly this is the issue
  
  const { iframeDoc } = JSON.parse(solutionData); // code is JSX/React source
  console.log("loaded the iframe::", iframeDoc)

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

  const commonPaths = [
    '/ms-playwright',
    '/opt/render/.cache/ms-playwright',
    '/root/.cache/ms-playwright'
  ];

  for (const browserPath of commonPaths) {
    try {
      if (fs.existsSync(browserPath)) {
        console.log(`Found browser directory: ${browserPath}`);
        const contents = fs.readdirSync(browserPath);
        console.log('Contents:', contents);
      }
    } catch (err) {
      console.log(`Cannot access ${browserPath}`);
    }
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/ms-playwright/chromium-1187/chrome-linux/chrome', // Explicit path
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox", 
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-zygote",
      "--single-process"
    ],
  });

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
