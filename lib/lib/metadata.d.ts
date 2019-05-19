export interface MetadataObject {
    dl: number;
    dlimit: number;
    pwd: boolean;
    owner: any;
    metadata: any;
    auth: string;
    nonce: string;
    prefix: string;
    expireAt: string;
    [k: string]: any;
}
export default class Metadata {
    dl: number;
    dlimit: number;
    pwd: boolean;
    owner: any;
    metadata: any;
    auth: string;
    nonce: string;
    constructor(obj: MetadataObject);
}
