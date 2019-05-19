"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = __importDefault(require("./mongodb"));
const redis_1 = __importDefault(require("./redis"));
function createDb({ databaseType, host, collection, env }) {
    if (databaseType === 'mongodb') {
        return mongodb_1.default({ mongoConnection: host, mongoCollection: collection });
    }
    return redis_1.default({ host, env });
}
exports.default = createDb;
//# sourceMappingURL=index.js.map