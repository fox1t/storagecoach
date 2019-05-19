import { Storage, Bucket } from '@google-cloud/storage'
import { StorageDriver } from './storage-driver'
import { Readable } from 'stream'
const storage = new Storage()

export default class GCSStorage implements StorageDriver {
  bucket: Bucket

  constructor(gcsBucket: string) {
    if (!gcsBucket) {
      throw new Error('Provide valid GCS Bucket.')
    }

    this.bucket = storage.bucket(gcsBucket)
  }

  async length(id: string): Promise<number> {
    const data = await this.bucket.file(id).getMetadata()
    return data[0].size
  }

  async getStream(id: string): Promise<Readable> {
    return this.bucket.file(id).createReadStream({ validation: false })
  }

  set(id: string, file: Readable): Promise<{}> {
    return new Promise((resolve, reject) => {
      file
        .pipe(
          this.bucket.file(id).createWriteStream({
            validation: false,
            resumable: false,
          }),
        )
        .on('error', reject)
        .on('finish', resolve)
    })
  }

  del(id: string) {
    return this.bucket.file(id).delete()
  }

  ping() {
    return this.bucket.exists()
  }
}
