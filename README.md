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
