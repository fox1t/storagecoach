import { MetadataObject } from '../lib/metadata';
interface DbConfig {
    env: string;
    host: string;
    databaseType?: 'redis' | 'mongodb';
    collection?: string;
}
export interface Db {
    ttl(id: string): Promise<number>;
    expire(id: string, expireSeconds: number): Promise<boolean>;
    get(id: string, property?: string): Promise<MetadataObject | string | null>;
    set(id: string, key: string | object, value?: string): Promise<boolean>;
    del(id: string): Promise<void>;
    ping(): Promise<string | boolean>;
    close(): Promise<any>;
}
export default function createDb({ databaseType, host, collection, env }: DbConfig): Db;
export {};
