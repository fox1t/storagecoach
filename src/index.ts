import { Readable } from 'stream'
import FSStorage from './fs'

export interface Storage {
  getType(): string
  getRoot(): string
  size(id: string): Promise<number | undefined>
  getStream(id: string): Promise<NodeJS.ReadableStream>
  set(id: string, file: Readable): Promise<{}>
  del(id: string): Promise<{} | void>
  ping(): Promise<any>
}

type StorageConstructor = new (...options: any[]) => Storage

export function CreateStorageCoach(path: string): Storage
export function CreateStorageCoach(ctor: StorageConstructor, options?: any): Storage
export default function CreateStorageCoach(
  ctor: string | StorageConstructor,
  ...options: any[]
): Storage {
  if (typeof ctor === 'function') {
    return new ctor(...options)
  }
  return new FSStorage(ctor)
}
