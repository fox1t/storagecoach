"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_uri_1 = require("mongodb-uri");
const mongodb_1 = require("mongodb");
class MongoDb {
    constructor(mongoConnection, mongoCollection = 'storagebus') {
        this.client = mongodb_1.MongoClient.connect(mongoConnection, { useNewUrlParser: true });
        this.collectionName = mongoCollection;
        this.dbName = mongodb_uri_1.parse(mongoConnection).database;
    }
    async ttl(id) {
        const expireTime = await this.get(id, 'expireAt');
        if (expireTime === null) {
            throw new Error(`Can't find expire time for the specified id.`);
        }
        return Math.floor((expireTime - Date.now()) / 1000);
    }
    async expire(id, expireSeconds) {
        const expireMS = expireSeconds * 1000;
        const client = await this.client;
        const collection = client.db(this.dbName).collection(this.collectionName);
        await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });
        await collection.findOneAndUpdate({ id }, { $set: { expireAt: new Date(Date.now() + expireMS) } });
        return true;
    }
    async get(id, property) {
        const client = await this.client;
        const obj = await client
            .db(this.dbName)
            .collection(this.collectionName)
            .findOne({ id });
        if (obj) {
            if (property) {
                return obj[property] ? obj[property] : null;
            }
            return obj;
        }
        return null;
    }
    async set(id, key, value) {
        const objectToSet = value ? { [key]: value } : key;
        const client = await this.client;
        await client
            .db(this.dbName)
            .collection(this.collectionName)
            .findOneAndUpdate({ id }, { $set: Object.assign({ id }, objectToSet) }, { upsert: true });
        return true;
    }
    async del(id) {
        const client = await this.client;
        await client
            .db(this.dbName)
            .collection(this.collectionName)
            .deleteOne({ id });
    }
    async ping() {
        return (await this.client).isConnected();
    }
    async close() {
        return (await this.client).close();
    }
}
function createMongoDbClient(config) {
    return new MongoDb(config.mongoConnection, config.mongoCollection);
}
exports.default = createMongoDbClient;
//# sourceMappingURL=mongodb.js.map