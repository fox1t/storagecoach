import {
  SharedKeyCredential,
  StorageURL,
  ServiceURL,
  ContainerURL,
  BlockBlobURL,
  uploadStreamToBlockBlob,
  Aborter,
  Pipeline,
} from '@azure/storage-blob'
import { Storage } from './'
import { Readable } from 'stream'

const ONE_MINUTE = 60 * 1000
const ONE_MEGABYTE = 1024 * 1024
const FOUR_MEGABYTES = 4 * ONE_MEGABYTE

// reference https://docs.microsoft.com/en-us/javascript/api/@azure/storage-blob/?view=azure-node-preview
export default class AZBlobStorage implements Storage {
  credentials: SharedKeyCredential
  pipeline: Pipeline
  serviceURL: ServiceURL
  containerURL: ContainerURL
  aborter: Aborter

  constructor(
    container: string,
    accountName: string | undefined = process.env.AZURE_ACCOUNT_NAME,
    accessKey: string | undefined = process.env.AZURE_ACCESS_KEY,
  ) {
    if (!accountName) {
      throw new Error(
        `Provide Azure AccountName either calling constructor or "process.env.AZURE_ACCOUNT_NAME"`,
      )
    }
    if (!accessKey) {
      throw new Error(
        `Provide Azure AccountKey either calling constructor or "process.env.AZURE_ACCESS_KEY"`,
      )
    }
    this.credentials = new SharedKeyCredential(accountName, accessKey)
    this.pipeline = StorageURL.newPipeline(this.credentials)
    this.serviceURL = new ServiceURL(`https://${accountName}.blob.core.windows.net`, this.pipeline)
    this.containerURL = ContainerURL.fromServiceURL(this.serviceURL, container)
    this.aborter = Aborter.timeout(30 * ONE_MINUTE)
  }

  async length(id: string) {
    const blobGetPropertiesResponse = await BlockBlobURL.fromContainerURL(
      this.containerURL,
      id,
    ).getProperties(this.aborter)
    return blobGetPropertiesResponse.contentLength
  }

  async getStream(id: string): Promise<NodeJS.ReadableStream> {
    const blobDownloadResponse = await BlockBlobURL.fromContainerURL(
      this.containerURL,
      id,
    ).download(this.aborter, 0)
    return blobDownloadResponse.readableStreamBody!
  }

  set(id: string, file: Readable) {
    const blockBlobURL = BlockBlobURL.fromContainerURL(this.containerURL, id)

    return uploadStreamToBlockBlob(this.aborter, file, blockBlobURL, FOUR_MEGABYTES, 5)
  }

  del(id: string) {
    const blockBlobURL = BlockBlobURL.fromContainerURL(this.containerURL, id)
    return blockBlobURL.delete(this.aborter)
  }

  ping() {
    return this.containerURL.getProperties(this.aborter)
  }
}
