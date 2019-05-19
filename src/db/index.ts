import createMongoDbClient from './mongodb'
import createRedisClient from './redis'
import { MetadataObject } from '../lib/metadata'

interface DbConfig {
  env: string
  host: string
  databaseType?: 'redis' | 'mongodb'
  collection?: string
}

export interface Db {
  // Returns remaining time to live of an id
  ttl(id: string): Promise<number>
  // Set a timeout on id
  expire(id: string, expireSeconds: number): Promise<boolean>
  // Returns full metadata object Returns single property of metadata object (hget and hgetall)
  get(id: string, property?: string): Promise<MetadataObject | string | null>
  // Rets single property or sub-property object (hset and hmset)
  set(id: string, key: string | object, value?: string): Promise<boolean>
  // Deletes metadata object
  del(id: string): Promise<void>
  ping(): Promise<string | boolean>
  close(): Promise<any>
}

// defaults to redis
export default function createDb({ databaseType, host, collection, env }: DbConfig): Db {
  if (databaseType === 'mongodb') {
    return createMongoDbClient({ mongoConnection: host, mongoCollection: collection })
  }
  return createRedisClient({ host, env })
}
