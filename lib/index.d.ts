/// <reference types="node" />
import Metadata from './lib/metadata';
import FSStorage from './storage/fs';
import GCSStorage from './storage/gcs';
import S3Storage from './storage/s3';
import AZBlobStorage from './storage/azure-blob';
import { Readable } from 'stream';
import { Db } from './db';
export interface StorageConfig {
    env: string;
    expireSeconds?: number;
    storageType: 's3' | 'gcs' | 'az' | 'fs';
    storageUri: string;
    storageUser?: string;
    storageKey?: string;
    databaseType?: 'redis' | 'mongodb';
    databaseHost: string;
    databaseCollection?: string;
}
declare class Storage {
    storage: FSStorage | GCSStorage | S3Storage | AZBlobStorage;
    expireSeconds: number;
    db: Db;
    constructor(config: StorageConfig);
    ttl(id: string): Promise<number>;
    getPrefixedId(id: string): Promise<string>;
    length(id: string): Promise<number | undefined>;
    get(id: string): Promise<NodeJS.ReadableStream | Readable | import("fs").ReadStream>;
    set(id: string, file: Readable, meta?: any, expireSeconds?: number): Promise<void>;
    setField(id: string, key: string, value: string): void;
    del(id: string): Promise<void>;
    ping(): Promise<void>;
    metadata(id: string): Promise<Metadata>;
    close(): Promise<void>;
}
declare const _default: (config: StorageConfig) => Storage;
export default _default;
