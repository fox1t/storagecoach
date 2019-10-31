import { Readable } from 'stream'

export interface Storage {
  length(id: string): Promise<number | undefined>
  getStream(id: string): Promise<NodeJS.ReadableStream>
  set(id: string, file: Readable): Promise<{}>
  del(id: string): Promise<{} | void>
  ping(): Promise<any>
}

export interface StorageConstructor {
  new (bucket: string, accountName?: string, accessKey?: string): Storage
}

export function CreateStorage(
  ctor: StorageConstructor,
  bucket: string,
  accountName?: string,
  accessKey?: string,
) {
  return new ctor(bucket, accountName, accessKey)
}
