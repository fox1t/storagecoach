import AWS from 'aws-sdk'
import { Storage } from './'
import { Readable } from 'stream'

const s3 = new AWS.S3()

export default class S3Storage implements Storage {
  bucket: string

  constructor(s3Bucket: string) {
    if (!s3Bucket) {
      throw new Error('Provide valid S3 Bucket.')
    }
    this.bucket = s3Bucket
  }

  async length(id: string) {
    const result = await s3.headObject({ Bucket: this.bucket, Key: id }).promise()
    return result.ContentLength
  }

  async getStream(id: string): Promise<Readable> {
    return s3.getObject({ Bucket: this.bucket, Key: id }).createReadStream()
  }

  set(id: string, file: Readable): Promise<AWS.S3.ManagedUpload.SendData> {
    const upload = s3.upload({
      Bucket: this.bucket,
      Key: id,
      Body: file,
    })
    file.on('error', () => upload.abort())
    return upload.promise()
  }

  del(id: string) {
    return s3.deleteObject({ Bucket: this.bucket, Key: id }).promise()
  }

  ping() {
    return s3.headBucket({ Bucket: this.bucket }).promise()
  }
}
