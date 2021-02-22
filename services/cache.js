const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require('../config/keys')

// const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  // Top level key must be string or number
  this.topLevelKey = JSON.stringify(options.key || "default");
  console.log('this.topLevelKey: ', this.topLevelKey)

  return this; // make cache() chain-able
};

mongoose.Query.prototype.exec = async function () {
  console.log("IM ABOUT TO RUN A QUERY.");
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // create top level key by using query and collection name
  // Object.assign(target, source1, source2, ...); return target
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // see if we have a value for 'key in redis
  const cachedValue = await client.hget(this.topLevelKey, key);

  // if we do, return that
  if (cachedValue) {
    console.log("Cached Value");
    // console.log("cachedValue: ", JSON.parse(cachedValue));
    const docs = JSON.parse(cachedValue);

    // because the returns from mongoose are documents, but
    // returns from redis are stringified JSON objects,
    // so we need to convert this JSON object to mongoose document
    if (Array.isArray(docs)) {
      const cachedResultArray = docs.map((doc) => new this.model(doc));
      return cachedResultArray;
    } else {
      const cachedResult = new this.model(docs);
      return cachedResult;
    }
  }

  // otherwise, issue the query and store the result in redis
  const result = await exec.apply(this, arguments);
  console.log("Mongoose Value");
  // console.log("result: ", result);
  client.hset(this.topLevelKey, key, JSON.stringify(result));
  client.expire(this.topLevelKey, 10)
  
  return result;
};

module.exports = {
  clearHash(hashkey) {
    client.del(JSON.stringify(hashkey))
  }
}
