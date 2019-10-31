import createMongoDbClient from './mongodb'
import createRedisClient from './redis'

interface DbConfig {
  env: string
  host: string
  databaseType?: 'redis' | 'mongodb'
  collection?: string
}

export interface Db<T = any> {
  // Returns remaining time to live of an id
  ttl(id: string): Promise<number>
  // Set a timeout on id
  expire(id: string, expireSeconds: number): Promise<void>
  // Returns full metadata object Returns single property of metadata object (hget and hgetall)
  get(id: string, property?: string): Promise<T | string | number | null>
  // Rets single property or sub-property object (hset and hmset)
  set(id: string, key: string | { [key: string]: string | number }, value?: string): Promise<void>
  // Deletes metadata object
  del(id: string): Promise<void>
  ping(): Promise<boolean>
  close(): Promise<void>
}

// defaults to redis
export default function createDb({ databaseType, host, collection, env }: DbConfig): Db {
  if (databaseType === 'mongodb') {
    return createMongoDbClient({ mongoConnection: host, mongoCollection: collection })
  }
  return createRedisClient({ host, env })
}
