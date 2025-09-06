import { createClient } from "redis";
import puppeteer from "puppeteer";
import * as Babel from '@babel/standalone';

const subscriber = createClient();
const redis = createClient();

await subscriber.connect();
await redis.connect();

await subscriber.subscribe("solution_channel", async (message) => {
  const { solutionId } = JSON.parse(message);

  // Pop user submission from queue
  const solutionData = await redis.lPop("solutions_queue");
  if (!solutionData) return;

  const { iframeDoc } = JSON.parse(solutionData); // code is JSX/React source

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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set HTML content
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  let isValid = false;

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

  await browser.close();

  // Publish result back to Redis
  await redis.publish("results_channel", JSON.stringify({
    solutionId,
    result: isValid ? "valid" : "invalid"
  }));
});
