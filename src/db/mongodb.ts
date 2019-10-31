import { parse } from 'mongodb-uri'
import { MongoClient } from 'mongodb'
import { Db } from '.'
import { MetadataObject } from '../lib/metadata'

interface MongoDbConfig {
  mongoConnection: string
  mongoCollection?: string
}

class MongoDb<T = MetadataObject> implements Db<T> {
  client: Promise<MongoClient>
  dbName: string
  collectionName: string

  constructor(mongoConnection: string | MongoClient, mongoCollection: string = 'storagecoach') {
    if (typeof mongoConnection === 'string') {
      this.client = MongoClient.connect(mongoConnection, { useNewUrlParser: true })
    } else {
      this.client = Promise.resolve(mongoConnection)
    }
    this.collectionName = mongoCollection
    this.dbName = parse(mongoConnection).database
  }

  // mimic https://redis.io/commands/ttl
  async ttl(id: string): Promise<number> {
    const expireTime = (await this.get(id, 'expireAt')) as number
    if (expireTime === null) {
      throw new Error(`Can't find expire time for the specified id.`)
    }
    return Math.floor((expireTime - Date.now()) / 1000)
  }
  // Set a timeout on id
  async expire(id: string, expireSeconds: number): Promise<void> {
    // NOTE: order to make ttl work on mongodb we need to add an index
    // call db.collection(storagecoachFiles).createIndex( { "expireAt": 1 }, { expireAfterSeconds: 0 } )
    const expireMS = expireSeconds * 1000
    const client = await this.client
    const collection = client.db(this.dbName).collection(this.collectionName)
    await collection.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })

    await collection.findOneAndUpdate(
      { id },
      { $set: { expireAt: new Date(Date.now() + expireMS) } },
    )
  }

  async get(id: string, property?: string): Promise<T | string | number | null> {
    const client = await this.client
    const obj: T | null = await client
      .db(this.dbName)
      .collection(this.collectionName)
      .findOne({ id })

    if (obj) {
      if (property) {
        return obj[property] ? obj[property] : null
      }
      return obj
    }
    return null
  }

  async set(
    id: string,
    key: string | { [key: string]: string | number },
    value?: string,
  ): Promise<void> {
    const objectToSet = value
      ? { [key as string]: value }
      : (key as { [key: string]: string | number })

    const client = await this.client
    await client
      .db(this.dbName)
      .collection(this.collectionName)
      .findOneAndUpdate({ id }, { $set: { id, ...objectToSet } }, { upsert: true })
  }

  async del(id: string): Promise<void> {
    const client = await this.client
    await client
      .db(this.dbName)
      .collection(this.collectionName)
      .deleteOne({ id })
  }

  async ping(): Promise<boolean> {
    return (await this.client).isConnected()
  }

  async close() {
    return (await this.client).close(true)
  }
}

export default function createMongoDbClient(config: MongoDbConfig) {
  return new MongoDb(config.mongoConnection, config.mongoCollection)
}
