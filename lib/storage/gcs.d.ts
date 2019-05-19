/// <reference types="node" />
/// <reference types="request" />
import { Bucket } from '@google-cloud/storage';
import { StorageDriver } from './storage-driver';
import { Readable } from 'stream';
export default class GCSStorage implements StorageDriver {
    bucket: Bucket;
    constructor(gcsBucket: string);
    length(id: string): Promise<number>;
    getStream(id: string): Promise<Readable>;
    set(id: string, file: Readable): Promise<{}>;
    del(id: string): Promise<[import("request").Response]>;
    ping(): Promise<[boolean]>;
}
