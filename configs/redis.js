/* eslint-disable no-console */
import { createClient } from "redis";

let redisClient;

if (process.env.IS_REDIS_ENABLE) {
    redisClient = createClient({
        url: `redis://:@${process.env.REDIS_HOST}:${
            process.env.REDIS_PORT || "6379"
        }`,
        database: process.env.REDIS_PRIMARY_DATABASE || 0,
    });

    const connectToRedis = async () => {
        try {
            await redisClient.connect();
            console.log("Redis connected successfully");
        } catch (error) {
            console.error("Error in Redis Connection:\n", error);
        }
    };
    connectToRedis();
} else {
    console.log(`Redis is disabled`);
}

export default redisClient;
