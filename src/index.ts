import Metadata from './db/metadata'
import FSStorage from './storage/fs'
import GCSStorage from './storage/gcs'
import S3Storage from './storage/s3'
import AZBlobStorage from './storage/azure-blob'
import { Readable } from 'stream'
import createDb, { Db } from './db'
import { CreateStorage } from './storage'
import StorageConfig from './config'

function getPrefix(seconds: number) {
  return Math.max(Math.floor(seconds / 86400), 1)
}

class Storage<T = Metadata> {
  storage: FSStorage | GCSStorage | S3Storage | AZBlobStorage
  expireSeconds: number
  db: Db<T>

  constructor(config: StorageConfig) {
    if (!config.storageUri) {
      throw new Error(`"Storage URI" property is mandatory.`)
    }
    if (config.storageType === 's3') {
      this.storage = CreateStorage(S3Storage, config.storageUri) as S3Storage
    } else if (config.storageType === 'gcs') {
      this.storage = CreateStorage(GCSStorage, config.storageUri) as GCSStorage
    } else if (config.storageType === 'az') {
      this.storage = CreateStorage(
        AZBlobStorage,
        config.storageUri,
        config.storageUser,
        config.storageKey,
      ) as AZBlobStorage
    } else {
      this.storage = CreateStorage(FSStorage, config.storageUri) as FSStorage
    }

    this.db = createDb({
      databaseType: config.databaseType,
      host: config.databaseHost,
      collection: config.databaseCollection,
      env: config.env,
    })

    this.expireSeconds = config.expireSeconds || 0
  }

  async ttl(id: string) {
    const result = await this.db.ttl(id)
    return Math.ceil(result) * 1000
  }

  async getPrefixedId(id: string) {
    const prefix = await this.db.get(id, 'prefix')
    return `${prefix}-${id}`
  }

  async length(id: string) {
    const filePath = await this.getPrefixedId(id)
    return this.storage.length(filePath)
  }

  async get(id: string) {
    const filePath = await this.getPrefixedId(id)
    return this.storage.getStream(filePath)
  }

  // this methods sets the prefix for the specified id
  async set(id: string, file: Readable, meta?: T, expireSeconds: number = this.expireSeconds) {
    const generatedPrefix = getPrefix(expireSeconds)
    const filePath = `${generatedPrefix}-${id}`
    await this.db.set(id, 'prefix', generatedPrefix.toString())
    if (!file.readable) {
      throw new Error('Passed stream is not readable.')
    }
    await this.storage.set(filePath, file)
    if (meta) {
      const { expireAt, prefix, ...realmeta } = meta as any

      await this.db.set(id, realmeta as any)
    }
    await this.db.expire(id, expireSeconds)
  }

  setField(id: string, key: string, value: string) {
    this.db.set(id, key, value)
  }

  async del(id: string) {
    const filePath = await this.getPrefixedId(id)
    await this.storage.del(filePath)
    await this.db.del(id)
  }

  async ping() {
    await this.db.ping()
    await this.storage.ping()
  }

  async metadata(id: string) {
    const result = await this.db.get<Metadata>(id)
    return result && new Metadata(result)
  }

  async close() {
    this.db.close()
  }
}

const StorageFactory = <T = Metadata>(config: StorageConfig) => new Storage<T>(config)
export = StorageFactory
