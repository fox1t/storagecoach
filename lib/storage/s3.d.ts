/// <reference types="node" />
import AWS from 'aws-sdk';
import { StorageDriver } from './storage-driver';
import { Readable } from 'stream';
export default class S3Storage implements StorageDriver {
    bucket: string;
    constructor(s3Bucket: string);
    length(id: string): Promise<number | undefined>;
    getStream(id: string): Promise<Readable>;
    set(id: string, file: Readable): Promise<AWS.S3.ManagedUpload.SendData>;
    del(id: string): Promise<import("aws-sdk/lib/request").PromiseResult<AWS.S3.DeleteObjectOutput, AWS.AWSError>>;
    ping(): Promise<{
        $response: AWS.Response<{}, AWS.AWSError>;
    }>;
}
