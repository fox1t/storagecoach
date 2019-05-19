export interface MetadataObject {
  dl: number
  dlimit: number
  pwd: boolean
  owner: any
  metadata: any
  auth: string
  nonce: string
  prefix: string
  expireAt: string
  [k: string]: any
}

export default class Metadata {
  dl: number
  dlimit: number
  pwd: boolean
  owner: any
  metadata: any
  auth: string
  nonce: string

  constructor(obj: MetadataObject) {
    this.dl = +obj.dl || 0
    this.dlimit = +obj.dlimit || 1
    this.pwd = String(obj.pwd) === 'true'
    this.owner = obj.owner
    this.metadata = obj.metadata
    this.auth = obj.auth
    this.nonce = obj.nonce
  }
}
