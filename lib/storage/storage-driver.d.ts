/// <reference types="node" />
import { Readable } from 'stream';
export interface StorageDriver {
    length(id: string): Promise<number | undefined>;
    getStream(id: string): Promise<NodeJS.ReadableStream>;
    set(id: string, file: Readable): Promise<{}>;
    del(id: string): Promise<{} | void>;
    ping(): Promise<any>;
}
