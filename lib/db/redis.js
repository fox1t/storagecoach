"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Redis {
    constructor(host, connectionTimeout, env) {
        const redisLib = env === 'development' && host === 'localhost' ? 'redis-mock' : 'redis';
        const redis = require(redisLib);
        this.client = redis.createClient({
            host,
            connect_timeout: connectionTimeout,
        });
        this.client.ttlAsync = util_1.promisify(this.client.ttl);
        this.client.hgetallAsync = util_1.promisify(this.client.hgetall);
        this.client.hgetAsync = util_1.promisify(this.client.hget);
        this.client.pingAsync = util_1.promisify(this.client.ping);
        this.client.on('error', err => {
            console.error('Redis:', err);
        });
    }
    async ttl(id) {
        return this.client.ttlAsync(id);
    }
    async expire(id, expireSeconds) {
        return this.client.expire(id, expireSeconds);
    }
    async get(id, property) {
        if (!property) {
            return this.client.hgetallAsync(id);
        }
        return this.client.hgetAsync(id, property);
    }
    async set(id, key, value) {
        if (!value) {
            return this.client.hmset(id, key);
        }
        return this.client.hset(id, key, value);
    }
    async del(id) {
        this.client.del(id);
    }
    async ping() {
        return this.client.pingAsync();
    }
    async close() { }
}
function createRedisClient({ host, connectionTimeout = 10000, env = process.env.NODE_ENV, }) {
    return new Redis(host, connectionTimeout, env);
}
exports.default = createRedisClient;
//# sourceMappingURL=redis.js.map