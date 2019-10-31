import fs, { ReadStream } from 'fs'
import path from 'path'
import { promisify } from 'util'
import mkdirp from 'mkdirp'
import { Storage } from './'
import { Readable } from 'stream'

const stat = promisify(fs.stat)

export default class FSStorage implements Storage {
  dir: string

  constructor(localDir: string) {
    if (!localDir) {
      throw new Error('Provide valid local directory.')
    }

    this.dir = localDir
    mkdirp.sync(this.dir)
  }

  async length(id: string): Promise<number> {
    const result = await stat(path.join(this.dir, id))
    return result.size
  }

  async getStream(id: string): Promise<ReadStream> {
    return fs.createReadStream(path.join(this.dir, id))
  }

  set(id: string, file: Readable): Promise<{}> {
    return new Promise((resolve, reject) => {
      const filepath = path.join(this.dir, id)
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
    return Promise.resolve(fs.unlinkSync(path.join(this.dir, id)))
  }

  ping() {
    return Promise.resolve()
  }
}
