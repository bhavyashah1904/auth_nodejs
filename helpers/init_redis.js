const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,password : `${process.env.REDIS_PASSWORD}`,
  legacyMode: true,
}); // set the legacy mode (v4 updated version is based on the Promise, but if you want to use v3 version based on the callback, you must set legacy mode_
redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.connect().then(); // connect to redis v4 (async)
const redisCli = redisClient.v4;
