"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const mkdirp_1 = __importDefault(require("mkdirp"));
const stat = util_1.promisify(fs_1.default.stat);
class FSStorage {
    constructor(localDir) {
        if (!localDir) {
            throw new Error('Provide valid local directory.');
        }
        this.dir = localDir;
        mkdirp_1.default.sync(this.dir);
    }
    async length(id) {
        const result = await stat(path_1.default.join(this.dir, id));
        return result.size;
    }
    async getStream(id) {
        return fs_1.default.createReadStream(path_1.default.join(this.dir, id));
    }
    set(id, file) {
        return new Promise((resolve, reject) => {
            const filepath = path_1.default.join(this.dir, id);
            const fstream = fs_1.default.createWriteStream(filepath);
            file.pipe(fstream);
            file.on('error', err => {
                fstream.destroy(err);
            });
            fstream.on('error', err => {
                fs_1.default.unlinkSync(filepath);
                reject(err);
            });
            fstream.on('finish', resolve);
        });
    }
    del(id) {
        return Promise.resolve(fs_1.default.unlinkSync(path_1.default.join(this.dir, id)));
    }
    ping() {
        return Promise.resolve();
    }
}
exports.default = FSStorage;
//# sourceMappingURL=fs.js.map