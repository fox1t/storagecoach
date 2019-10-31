export interface StorageConfig {
  env: string
  storageUri: string
  storageType: 's3' | 'gcs' | 'az' | 'fs'

  storageUser?: string
  storageKey?: string

  databaseType?: 'redis' | 'mongodb'
  databaseHost: string
  databaseCollection?: string

  expireSeconds?: number
}

export default StorageConfig
