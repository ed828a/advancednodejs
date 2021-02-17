const redis = require("redis");
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);

client.set('hi', 'there');
client.get('hi', (err, value) =>  { console.log(value)})

client.hset('german', 'red', 'rot');
client.hget('german', 'red', console.log);

client.set('colors', JSON.stringify({red: 'rojo'}));
client.get('colors', (err, val) => console.log(JSON.parse(val)));
 
// client.on("error", function(error) {
//   console.error(error);
// });
