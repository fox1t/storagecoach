"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3();
class S3Storage {
    constructor(s3Bucket) {
        if (!s3Bucket) {
            throw new Error('Provide valid S3 Bucket.');
        }
        this.bucket = s3Bucket;
    }
    async length(id) {
        const result = await s3.headObject({ Bucket: this.bucket, Key: id }).promise();
        return result.ContentLength;
    }
    async getStream(id) {
        return s3.getObject({ Bucket: this.bucket, Key: id }).createReadStream();
    }
    set(id, file) {
        const upload = s3.upload({
            Bucket: this.bucket,
            Key: id,
            Body: file,
        });
        file.on('error', () => upload.abort());
        return upload.promise();
    }
    del(id) {
        return s3.deleteObject({ Bucket: this.bucket, Key: id }).promise();
    }
    ping() {
        return s3.headBucket({ Bucket: this.bucket }).promise();
    }
}
exports.default = S3Storage;
//# sourceMappingURL=s3.js.map