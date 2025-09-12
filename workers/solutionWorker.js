import { createClient } from "redis";
import { chromium } from "playwright";
import * as Babel from '@babel/standalone';

import fs from 'fs';

async function launchBrowser() {
  // Try multiple strategies
  const strategies = [
    // Strategy 1: Let Playwright auto-detect
    { executablePath: undefined, name: 'auto-detect' },
    
    // Strategy 2: Common Docker paths
    { executablePath: '/usr/bin/chromium', name: 'system chromium' },
    { executablePath: '/usr/bin/chromium-browser', name: 'system chromium-browser' },
    { executablePath: '/usr/bin/google-chrome', name: 'system chrome' },
    { executablePath: '/usr/bin/google-chrome-stable', name: 'system chrome stable' },
    
    // Strategy 3: Playwright installed paths
    { executablePath: '/root/.cache/ms-playwright/chromium-1187/chrome-linux/chrome', name: 'playwright root cache' },
    { executablePath: '/app/browsers/chromium-1187/chrome-linux/chrome', name: 'app browsers' },
  ];

  for (const strategy of strategies) {
    try {
      console.log(`Trying strategy: ${strategy.name}`);
      
      // Check if executable exists (if path specified)
      if (strategy.executablePath && !fs.existsSync(strategy.executablePath)) {
        console.log(`Executable not found: ${strategy.executablePath}`);
        continue;
      }

      const browser = await chromium.launch({
        headless: true,
        executablePath: strategy.executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--disable-dev-shm-usage",
          "--no-zygote",
          "--single-process"
        ],
      });

      console.log(`✅ Successfully launched browser with: ${strategy.name}`);
      return browser;
      
    } catch (err) {
      console.log(`❌ Failed with ${strategy.name}: ${err.message}`);
    }
  }
  
  throw new Error('Could not launch browser with any strategy');
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
