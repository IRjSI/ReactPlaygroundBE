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