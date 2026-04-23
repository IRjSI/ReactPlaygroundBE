import { getRedisClient } from "./redis.js";

export const getCached = async (key) => {
    try {
        const redis = getRedisClient;
        if (!redis) return null;

        const cached = await redis.get(key);
        if (!cached) return null;

        return JSON.parse(cached);
    } catch (error) {
        console.log("Cache read error::", error.message);
        return null;
    }
}

export const setCached = async (key, value, ttl = 300) => {
    try {
        const redis = getRedisClient;
        if (!redis) return null;

        await redis.set(key, JSON.stringify(value), {
            EX: ttl
        });
    } catch (error) {
        console.log("Cache delete error:", error.message);
    }
}

export const deleteCached = async (key) => {
    try {
        const redis = getRedisClient;
        if (!redis) return null;

        await redis.del(key);
    } catch (error) {
        console.log("Cache delete error:", error.message);
    }
}