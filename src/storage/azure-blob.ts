import { StorageSharedKeyCredential, BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import { AbortController, AbortSignal } from '@azure/abort-controller'
import { Storage } from './'
import { Readable } from 'stream'

const ONE_MINUTE = 60 * 1000

// reference https://azuresdkdocs.blob.core.windows.net/$web/javascript/azure-storage-blob/12.0.0/classes/blockblobclient.html#downloadtobuffer
export default class AZBlobStorage implements Storage {
  credentials: StorageSharedKeyCredential
  blobServiceClient: BlobServiceClient
  containerClient: ContainerClient
  abortSignal: AbortSignal

  constructor(
    containerName: string,
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
    this.credentials = new StorageSharedKeyCredential(accountName, accessKey)
    this.blobServiceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      this.credentials,
    )
    this.containerClient = this.blobServiceClient.getContainerClient(containerName)
    this.abortSignal = AbortController.timeout(30 * ONE_MINUTE)
  }

  async length(id: string) {
    if (!(await this.containerClient.exists())) {
      await this.containerClient.create()
    }
    const blobGetPropertiesResponse = await this.containerClient
      .getBlockBlobClient(id)
      .getProperties({ abortSignal: this.abortSignal })
    return blobGetPropertiesResponse.contentLength
  }

  async getStream(id: string): Promise<NodeJS.ReadableStream> {
    if (!(await this.containerClient.exists())) {
      await this.containerClient.create()
    }
    const blobDownloadResponse = await this.containerClient
      .getBlockBlobClient(id)
      .download(0, undefined, { abortSignal: this.abortSignal })
    return blobDownloadResponse.readableStreamBody!
  }

  async set(id: string, file: Readable) {
    if (!(await this.containerClient.exists())) {
      await this.containerClient.create()
    }
    return this.containerClient
      .getBlockBlobClient(id)
      .uploadStream(file, undefined, undefined, { abortSignal: this.abortSignal })
  }

  async del(id: string) {
    if (!(await this.containerClient.exists())) {
      await this.containerClient.create()
    }
    return this.containerClient
      .getBlockBlobClient(id)
      .delete({ abortSignal: this.abortSignal, deleteSnapshots: 'include' })
  }

  ping() {
    return this.containerClient.exists({ abortSignal: this.abortSignal })
  }
}
