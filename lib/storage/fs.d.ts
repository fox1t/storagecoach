/// <reference types="node" />
import { ReadStream } from 'fs';
import { StorageDriver } from './storage-driver';
import { Readable } from 'stream';
export default class FSStorage implements StorageDriver {
    dir: string;
    constructor(localDir: string);
    length(id: string): Promise<number>;
    getStream(id: string): Promise<ReadStream>;
    set(id: string, file: Readable): Promise<{}>;
    del(id: string): Promise<void>;
    ping(): Promise<void>;
}
