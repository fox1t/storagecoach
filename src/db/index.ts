import { Metadata } from './metadata'
import createMongoDbClient from './mongodb'
import createRedisClient from './redis'

interface DbConfig {
  env: string
  host: string
  databaseType?: 'redis' | 'mongodb'
  collection?: string
}

export interface Db<T> {
  // Returns remaining time to live of an id
  ttl(id: string): Promise<number>
  // Set a timeout on id
  expire(id: string, expireSeconds: number): Promise<void>
  // Returns full metadata object Returns single property of metadata object (hget and hgetall)
  get<M = T | string | number>(
    id: string,
    property?: string,
  ): Promise<(M & { prefix: string }) | null>
  // Rets single property or sub-property object (hset and hmset)
  set(id: string, key: string | { [key: string]: string | number }, value?: string): Promise<void>
  // Deletes metadata object
  del(id: string): Promise<void>
  ping(): Promise<boolean>
  close(): Promise<void>
}

// defaults to redis
export default function createDb<T = Metadata>({
  databaseType,
  host,
  collection,
  env,
}: DbConfig): Db<T> {
  if (databaseType === 'mongodb') {
    return createMongoDbClient<T>({ mongoConnection: host, mongoCollection: collection })
  }
  return createRedisClient<T>({ host, env })
}
