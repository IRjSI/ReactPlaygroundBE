# Implementing *Queue* (with Redis) and *Workers*

## Flow
1. User submits the solution.
2. Frontend sends it to backend via API request, with axios or fetch.
3. Backend adds it to the *queue*.
4. Backend also **publishes** it via *Redis pub/sub*.
5. A worker is **subscribed** to it.
6. The worker validates the solution.
7. With websockets backend keeps asking worker if the validation is complete and gets the result(valid/invalid).

# Redis issue in production(queuing)
Maybe because of the url provided by **Render**. Render provides one instance of key/value for free trial and that is `redis://...` and not `rediss://...` queues are blocked due to this in production mode, works fine in dev mode.

### The actual issue:
Need to start worker separately on Render (:face palm:)

## The PaaS problem:
On Render (and most PaaS like Railway, Heroku, etc.), each service only runs one process from your start script.

That means:
- In dev, you can use concurrently or nodemon locally to run multiple processes in one terminal.
- In prod on Render, you cannot run both app.js and workers/solutionWorker.js in a single service.

### BUT
Since Render doesn't provide free background worker service, we'll start both in single file.
```js
import "./workers/solutionWorker.js"; 
```
By adding this line in `app.js`

### Also 
Do not use `puppeteer-core` as it doesn't come with chrome by default, so use `puppeteer`

The solution that worked:
```jsx
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
```

## The Docker File
Puppeteer Configuration
```dockerfile
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```
Environment variable that tells Puppeteer not to download its own Chromium
Why?: We already installed Chrome manually, so downloading another browser wastes time and space

```dockerfile
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```
Tells Puppeteer where to find Chrome
Without this, Puppeteer would look for its bundled Chromium and fail

#### Skip-chromium-download
When we run npm install puppeteer, Puppeteer has a post-install script that automatically downloads Chromium. This environment variable tells that script to skip the download.

##### Step-by-step:
What happens during npm ci:

- npm reads package.json and sees puppeteer as a dependency
- npm downloads puppeteer from npm registry
- Puppeteer's post-install script runs (node install.js)
- The install script checks for PUPPETEER_SKIP_CHROMIUM_DOWNLOAD environment variable
- If set to true: Skips Chromium download

#### Local V/S Production
```jsx
if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
}
```
The condition is `false` in local dev if env variables are not provided, but in production we are providing env variables with docker file, so `true`