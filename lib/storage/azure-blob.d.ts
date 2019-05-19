/// <reference types="node" />
import { SharedKeyCredential, ServiceURL, ContainerURL, Aborter, Pipeline } from '@azure/storage-blob';
import { StorageDriver } from './storage-driver';
import { Readable } from 'stream';
export default class AZBlobStorage implements StorageDriver {
    credentials: SharedKeyCredential;
    pipeline: Pipeline;
    serviceURL: ServiceURL;
    containerURL: ContainerURL;
    aborter: Aborter;
    constructor(container: string, accountName?: string | undefined, accessKey?: string | undefined);
    length(id: string): Promise<number | undefined>;
    getStream(id: string): Promise<NodeJS.ReadableStream>;
    set(id: string, file: Readable): Promise<import("@azure/storage-blob").BlobUploadCommonResponse>;
    del(id: string): Promise<import("@azure/storage-blob/typings/lib/generated/lib/models").BlobDeleteResponse>;
    ping(): Promise<import("@azure/storage-blob/typings/lib/generated/lib/models").ContainerGetPropertiesResponse>;
}
