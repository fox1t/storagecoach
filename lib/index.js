"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const metadata_1 = __importDefault(require("./lib/metadata"));
const db_1 = __importDefault(require("./db"));
function getPrefix(seconds) {
    return Math.max(Math.floor(seconds / 86400), 1);
}
class Storage {
    constructor(config) {
        if (!config.storageUri) {
            throw new Error(`"Storage URI" property is mandatory.`);
        }
        let StorageDriver;
        if (config.storageType === 's3') {
            StorageDriver = require('./storage/s3').default;
        }
        else if (config.storageType === 'gcs') {
            StorageDriver = require('./storage/gcs').default;
        }
        else if (config.storageType === 'az') {
            StorageDriver = require('./storage/azure-blob').default;
        }
        else {
            StorageDriver = require('./storage/fs').default;
        }
        this.storage = new StorageDriver(config.storageUri, config.storageUser, config.storageKey);
        this.db = db_1.default({
            databaseType: config.databaseType,
            host: config.databaseHost,
            collection: config.databaseCollection,
            env: config.env,
        });
        this.expireSeconds = config.expireSeconds || 0;
    }
    async ttl(id) {
        const result = await this.db.ttl(id);
        return Math.ceil(result) * 1000;
    }
    async getPrefixedId(id) {
        const prefix = await this.db.get(id, 'prefix');
        return `${prefix}-${id}`;
    }
    async length(id) {
        const filePath = await this.getPrefixedId(id);
        return this.storage.length(filePath);
    }
    async get(id) {
        const filePath = await this.getPrefixedId(id);
        return this.storage.getStream(filePath);
    }
    async set(id, file, meta, expireSeconds = this.expireSeconds) {
        const prefix = getPrefix(expireSeconds);
        const filePath = `${prefix}-${id}`;
        await this.db.set(id, 'prefix', prefix.toString());
        if (!file.readable) {
            throw new Error('Passed stream is not readable.');
        }
        await this.storage.set(filePath, file);
        if (meta) {
            await this.db.set(id, meta);
        }
        await this.db.expire(id, expireSeconds);
    }
    setField(id, key, value) {
        this.db.set(id, key, value);
    }
    async del(id) {
        const filePath = await this.getPrefixedId(id);
        await this.storage.del(filePath);
        await this.db.del(id);
    }
    async ping() {
        await this.db.ping();
        await this.storage.ping();
    }
    async metadata(id) {
        const result = (await this.db.get(id));
        return result && new metadata_1.default(result);
    }
    async close() {
        this.db.close();
    }
}
exports.default = (config) => new Storage(config);
//# sourceMappingURL=index.js.map