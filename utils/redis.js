import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
  },
});

client.connect();

