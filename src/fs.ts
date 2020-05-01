import fs, { ReadStream } from 'fs'
import path from 'path'
import { promisify } from 'util'
import mkdirp from 'mkdirp'
import { Storage } from './'
import { Readable } from 'stream'

const StorageType = Symbol('type')
const RootDir = Symbol('rootDir')

const stat = promisify(fs.stat)
const unlink = promisify(fs.unlink)

export default class FSStorage implements Storage {
  constructor(localDir: string) {
    if (!localDir) {
      throw new Error('Provide valid local directory.')
    }

    this[StorageType] = 'fs'
    this[RootDir] = localDir

    mkdirp.sync(this[RootDir])
  }

  getType(): string {
    return this[StorageType]
  }

  getRoot(): string {
    return this[RootDir]
  }

  async size(id: string): Promise<number> {
    const result = await stat(path.join(this[RootDir], id))
    return result.size
  }

  async getStream(id: string): Promise<ReadStream> {
    const filePath = path.join(this[RootDir], id)
    try {
      const stats = await stat(filePath) // checks if file exists before creating the stream
      if (!stats.isFile()) {
        throw new Error()
      }
    } catch (err) {
      return Promise.reject(new Error(`ENOENT: no such file, open '${filePath}'`))
    }
    return fs.createReadStream(filePath)
  }

  set(id: string, file: Readable): Promise<{}> {
    return new Promise((resolve, reject) => {
      const filepath = path.join(this[RootDir], id)
      const fstream = fs.createWriteStream(filepath)
      file.pipe(fstream)
      file.on('error', err => {
        fstream.destroy(err)
      })
      fstream.on('error', err => {
        fs.unlinkSync(filepath)
        reject(err)
      })
      fstream.on('finish', resolve)
    })
  }

  del(id: string) {
    return unlink(path.join(this[RootDir], id))
  }

  ping() {
    return Promise.resolve(stat(this[RootDir]))
  }
}
