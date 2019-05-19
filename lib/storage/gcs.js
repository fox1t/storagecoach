"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage();
class GCSStorage {
    constructor(gcsBucket) {
        if (!gcsBucket) {
            throw new Error('Provide valid GCS Bucket.');
        }
        this.bucket = storage.bucket(gcsBucket);
    }
    async length(id) {
        const data = await this.bucket.file(id).getMetadata();
        return data[0].size;
    }
    async getStream(id) {
        return this.bucket.file(id).createReadStream({ validation: false });
    }
    set(id, file) {
        return new Promise((resolve, reject) => {
            file
                .pipe(this.bucket.file(id).createWriteStream({
                validation: false,
                resumable: false,
            }))
                .on('error', reject)
                .on('finish', resolve);
        });
    }
    del(id) {
        return this.bucket.file(id).delete();
    }
    ping() {
        return this.bucket.exists();
    }
}
exports.default = GCSStorage;
//# sourceMappingURL=gcs.js.map