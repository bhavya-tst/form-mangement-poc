import redisClient from "../config/redis.js";

export const get = async (endPoint) => {
  try {
    const data = await redisClient.GET(endPoint);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error in Redis operation: ", error);
    return null;
  }
};

export const set = async (endPoint, data, expirationTime) => {
  try {
    const jsonData = JSON.stringify(data);

    if (expirationTime) {
      await redisClient.SET(endPoint, jsonData, {EX: expirationTime});
    } else {
      await redisClient.SET(endPoint, jsonData);
    }
  } catch (error) {
    console.error("Error in Redis operation: ", error);
  }
};
export const del = async (endPoint) => {
  try {
    await redisClient.DEL(endPoint);
  } catch (error) {
    console.error("Error in Redis operation: ", error);
  }
};

export const hDel = async (endPoint) => {
  try {
    const keys = await redisClient.KEYS(endPoint);
    if (keys.length) {
      await redisClient.DEL(keys);
    }
  } catch (error) {
    console.error("Error in Redis operation: ", error);
  }
};

export const flushAll = async () => {
  try {
    await redisClient.FLUSHALL();
  } catch (error) {
    console.error("Error in Redis operation: ", error);
  }
};
