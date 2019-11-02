import { promisify } from 'util'
import { RedisClient } from 'redis'

import { Db } from '.'
import { Metadata } from './metadata'

interface RedisConfig {
  host: string
  connectionTimeout?: number
  env?: string
}

export interface PromisifiedRedis<T> extends RedisClient {
  ttlAsync(key: string): Promise<number>
  hgetallAsync(key: string): Promise<T>
  hgetAsync(key: string, field: string): Promise<string>
  pingAsync(): Promise<string>
}

class Redis<T = Metadata> implements Db<T> {
  client: PromisifiedRedis<T>

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
  async expire(id: string, expireSeconds: number): Promise<void> {
    this.client.expire(id, expireSeconds)
  }
  // Returns full metadata object Returns single property of metadata object (hget and hgetall)
  async get<M = T | string | number>(
    id: string,
    property?: string,
  ): Promise<(M & { prefix: string }) | null> {
    if (!property) {
      return this.client.hgetallAsync(id) as any
    }
    return this.client.hgetAsync(id, property) as any
  }
  // Sets single property or sub-property object (hset and hmset)
  async set(
    id: string,
    key: string | { [key: string]: string | number },
    value?: string,
  ): Promise<void> {
    if (!value) {
      this.client.hmset(id, key)
    } else {
      this.client.hset(id, key as string, value)
    }
  }
  // Deletes metadata object
  async del(id: string): Promise<void> {
    this.client.del(id)
  }
  async ping(): Promise<boolean> {
    const pong = await this.client.pingAsync()
    return pong ? true : false
  }
  async close() {
    this.client.quit()
  }
}

export default function createRedisClient<T = Metadata>({
  host,
  connectionTimeout = 10000,
  env = process.env.NODE_ENV,
}: RedisConfig) {
  return new Redis<T>(host, connectionTimeout, env)
}
