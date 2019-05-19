"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const storage_blob_1 = require("@azure/storage-blob");
const ONE_MINUTE = 60 * 1000;
const ONE_MEGABYTE = 1024 * 1024;
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE;
class AZBlobStorage {
    constructor(container, accountName = process.env.AZURE_ACCOUNT_NAME, accessKey = process.env.AZURE_ACCESS_KEY) {
        if (!accountName) {
            throw new Error(`Provide Azure AccountName either calling constructor or "process.env.AZURE_ACCOUNT_NAME"`);
        }
        if (!accessKey) {
            throw new Error(`Provide Azure AccountKey either calling constructor or "process.env.AZURE_ACCESS_KEY"`);
        }
        this.credentials = new storage_blob_1.SharedKeyCredential(accountName, accessKey);
        this.pipeline = storage_blob_1.StorageURL.newPipeline(this.credentials);
        this.serviceURL = new storage_blob_1.ServiceURL(`https://${accountName}.blob.core.windows.net`, this.pipeline);
        this.containerURL = storage_blob_1.ContainerURL.fromServiceURL(this.serviceURL, container);
        this.aborter = storage_blob_1.Aborter.timeout(30 * ONE_MINUTE);
    }
    async length(id) {
        const blobGetPropertiesResponse = await storage_blob_1.BlockBlobURL.fromContainerURL(this.containerURL, id).getProperties(this.aborter);
        return blobGetPropertiesResponse.contentLength;
    }
    async getStream(id) {
        const blobDownloadResponse = await storage_blob_1.BlockBlobURL.fromContainerURL(this.containerURL, id).download(this.aborter, 0);
        return blobDownloadResponse.readableStreamBody;
    }
    set(id, file) {
        const blockBlobURL = storage_blob_1.BlockBlobURL.fromContainerURL(this.containerURL, id);
        return storage_blob_1.uploadStreamToBlockBlob(this.aborter, file, blockBlobURL, FOUR_MEGABYTES, 5);
    }
    del(id) {
        const blockBlobURL = storage_blob_1.BlockBlobURL.fromContainerURL(this.containerURL, id);
        return blockBlobURL.delete(this.aborter);
    }
    ping() {
        return this.containerURL.getProperties(this.aborter);
    }
}
exports.default = AZBlobStorage;
//# sourceMappingURL=azure-blob.js.map