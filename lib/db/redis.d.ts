import { RedisClient } from 'redis';
import { Db } from '.';
import { MetadataObject } from '../lib/metadata';
interface RedisConfig {
    host: string;
    connectionTimeout?: number;
    env?: string;
}
export interface PromisifiedRedis extends RedisClient {
    ttlAsync(key: string): Promise<number>;
    hgetallAsync(key: string): Promise<MetadataObject>;
    hgetAsync(key: string, field: string): Promise<string>;
    pingAsync(): Promise<string>;
}
declare class Redis implements Db {
    client: PromisifiedRedis;
    constructor(host: string, connectionTimeout: number, env?: string);
    ttl(id: string): Promise<number>;
    expire(id: string, expireSeconds: number): Promise<boolean>;
    get(id: string, property?: string): Promise<MetadataObject | string | null>;
    set(id: string, key: string | object, value?: string): Promise<boolean>;
    del(id: string): Promise<void>;
    ping(): Promise<string>;
    close(): Promise<void>;
}
export default function createRedisClient({ host, connectionTimeout, env, }: RedisConfig): Redis;
export {};
