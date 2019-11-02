export interface MetadataOptions {
  dl: number // number of downloads
  dlimit: number // download limit
  owner: string // unique id used to identify the user
  metadata: unknown // custom additional metadata
  prefix?: string // custom prefix
  expireAt?: number // after this date it will not be possible to
}

export class Metadata {
  dl: number // number of downloads
  dlimit: number // download limit
  owner: string // unique id used to identify the user
  metadata: unknown // custom additional metadata
  prefix?: string // custom prefix
  expireAt?: number // after this date it will not be possible to access the file anymore

  constructor(obj: MetadataOptions) {
    this.dl = +obj.dl || 0
    this.dlimit = +obj.dlimit || 0
    this.owner = obj.owner
    this.metadata = obj.metadata
    this.prefix = obj.prefix
    this.expireAt = obj.expireAt || 0
  }
}

export default Metadata
