import { promisify } from 'util'
import { RedisClient } from 'redis'
import { Db } from '.'
import { MetadataObject } from '../lib/metadata'

interface RedisConfig {
  host: string
  connectionTimeout?: number
  env?: string
}

export interface PromisifiedRedis extends RedisClient {
  ttlAsync(key: string): Promise<number>
  hgetallAsync(key: string): Promise<MetadataObject>
  hgetAsync(key: string, field: string): Promise<string>
  pingAsync(): Promise<string>
}

class Redis implements Db {
  client: PromisifiedRedis

  constructor(host: string, connectionTimeout: number, env?: string) {
    const redisLib = env === 'development' && host === 'localhost' ? 'redis-mock' : 'redis'
    const redis = require(redisLib)

    this.client = redis.createClient({
      host,
      connect_timeout: connectionTimeout,
    })

    this.client.ttlAsync = promisify(this.client.ttl)
    this.client.hgetallAsync = promisify(this.client.hgetall) as any
    this.client.hgetAsync = promisify(this.client.hget)
    this.client.pingAsync = promisify(this.client.ping)

    this.client.on('error', err => {
      console.error('Redis:', err)
    })
  }
  // Returns remaining time to live of an id
  async ttl(id: string): Promise<number> {
    return this.client.ttlAsync(id)
  }
  // Set a timeout on id
  async expire(id: string, expireSeconds: number): Promise<boolean> {
    return this.client.expire(id, expireSeconds)
  }
  // Returns full metadata object Returns single property of metadata object (hget and hgetall)
  async get(id: string, property?: string): Promise<MetadataObject | string | null> {
    if (!property) {
      return this.client.hgetallAsync(id)
    }
    return this.client.hgetAsync(id, property)
  }
  // Rezs single property or sub-property object (hset and hmset)
  async set(id: string, key: string | object, value?: string): Promise<boolean> {
    if (!value) {
      return (this.client.hmset as any)(id, key)
    }

    return this.client.hset(id, key as string, value)
  }
  // Deletes metadata object
  async del(id: string): Promise<void> {
    this.client.del(id)
  }
  async ping(): Promise<string> {
    return this.client.pingAsync()
  }
  async close() {}
}

export default function createRedisClient({
  host,
  connectionTimeout = 10000,
  env = process.env.NODE_ENV,
}: RedisConfig) {
  return new Redis(host, connectionTimeout, env)
}
