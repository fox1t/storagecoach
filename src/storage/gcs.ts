import { Storage as GoogleStorage, Bucket } from '@google-cloud/storage'
import { Storage } from './'
import { Readable } from 'stream'

const storage = new GoogleStorage()

export default class GCSStorage implements Storage {
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
