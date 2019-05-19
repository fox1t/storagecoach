import { MongoClient } from 'mongodb';
import { Db } from '.';
interface MongoDbConfig {
    mongoConnection: string;
    mongoCollection?: string;
}
declare class MongoDb implements Db {
    client: Promise<MongoClient>;
    dbName: string;
    collectionName: string;
    constructor(mongoConnection: string, mongoCollection?: string);
    ttl(id: string): Promise<number>;
    expire(id: string, expireSeconds: number): Promise<boolean>;
    get(id: string, property?: string): Promise<any>;
    set(id: string, key: string | object, value?: string): Promise<boolean>;
    del(id: string): Promise<void>;
    ping(): Promise<boolean>;
    close(): Promise<void>;
}
export default function createMongoDbClient(config: MongoDbConfig): MongoDb;
export {};
