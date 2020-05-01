import { test } from 'tap'
import fs, { createReadStream } from 'fs'
import { tmpdir } from 'os'
import { promisify } from 'util'
import { join } from 'path'
import { Readable } from 'stream'
import rimraf from 'rimraf'

import Storage from '../src'
import FSStorage from '../src/fs'

const mkdtemp = promisify(fs.mkdtemp)

test('StorageCouch', async function (t) {
  const tempDir = await mkdtemp(join(tmpdir(), 'storagecouch-'))
  const tempDir2 = await mkdtemp(join(tmpdir(), 'storagecouch-'))
  const storage = Storage(tempDir)

  const png = createReadStream(join(__dirname, './files/storagecoach.png'))

  await storage.set('png', png)

  t.tearDown(() => {
    rimraf.sync(tempDir)
  })

  t.test('fails to construct Storage if missing path parameter', async function ({ plan, throws }) {
    plan(1)
    throws(Storage)
  })

  t.test('constructor accepts plugin', async function ({ plan, equal }) {
    plan(1)
    const stroage2 = Storage(FSStorage, tempDir2)
    equal(stroage2.getType(), 'fs')
  })

  t.test('returns the file size', async function ({ plan, equal }) {
    plan(1)
    const len = await storage.size('png')
    equal(len, 435448)
  })

  t.test('returns fs Stroage type', async function ({ plan, equal }) {
    plan(1)
    const type = storage.getType()
    equal(type, 'fs')
  })

  t.test('get returns a stream', async function ({ plan, equal }) {
    plan(1)
    const s = await storage.getStream('png')
    equal(s instanceof Readable, true)
  })

  t.test('del deletes file from the storage', async function ({ plan, rejects }) {
    plan(1)
    const fileStream = createReadStream(join(__dirname, './files/storagecoach.png'))
    await storage.set('png2', fileStream)
    await storage.del('png2')

    rejects(async () => {
      await storage.getStream('png2')
    })
  })

  t.test('ping checks if the storage is working', async function ({ plan, type }) {
    plan(1)
    const stats = await storage.ping()
    type(stats, 'object')
  })
  t.test('getRoot returns root folder', async function ({ plan, equal }) {
    plan(1)
    equal(storage.getRoot(), tempDir)
  })

  t.end()
})

//   t.test('set', function (tc) {
//     tc.test('sets expiration to expire time', async function (tap) {
//       tap.plan(1)
//       const seconds = 100
//       const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('y', fileStream, { foo: 'bar' }, seconds)
//       const s = await storage.db.ttl('y')
//       await storage.del('y')
//       tap.equal(Math.ceil(s), seconds)
//     })

//     tc.test('adds right prefix based on expire time', async function (tap) {
//       tap.plan(3)
//       let fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('x', fileStream, { foo: 'bar' }, 300)
//       const pathX = await storage.getPrefixedId('x')
//       tap.equal(pathX, '1-x')
//       await storage.del('x')

//       fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('y', fileStream, { foo: 'bar' }, 86400)
//       const pathY = await storage.getPrefixedId('y')
//       tap.equal(pathY, '1-y')
//       await storage.del('y')

//       fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('z', fileStream, { foo: 'bar' }, 86400 * 7)
//       const pathZ = await storage.getPrefixedId('z')
//       tap.equal(pathZ, '7-z')
//       await storage.del('z')
//     })

//     tc.test('sets metadata', async function (tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       const m = { foo: 'bar' }
//       await storage.set('x', fileStream, m)
//       const meta = await storage.db.get('x')
//       delete meta!.prefix
//       await storage.del('x')
//       tap.deepEqual(meta, m)
//     })
//     tc.end()
//   })

//   t.test('setField', function (tc) {
//     tc.test('works', async function (tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('x', fileStream)
//       storage.setField('x', 'y', 'z')
//       const z = await storage.db.get('x', 'y')
//       tap.equal(z, 'z')
//       await storage.del('x')
//     })
//     tc.end()
//   })

//   t.test('del', function (tc) {
//     tc.test('works', async function (tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
//       await storage.set('x', fileStream, { foo: 'bar' })
//       await storage.del('x')
//       const meta = await storage.metadata('x')
//       tap.equal(meta, null)
//     })
//     tc.end()
//   })

//   t.test('ping', function (tc) {
//     tc.test('works', async function (tap) {
//       await storage.ping()
//       tap.pass()
//     })
//     tc.end()
//   })

//   t.test('metadata', function (tc) {
//     const storage2 = Storage(config)
//     tc.test('returns all metadata fields', async function (tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/file.txt'))
//       const m = {
//         dl: 1,
//         dlimit: 1,
//         metadata: 'bar',
//         owner: 'bmo',
//         expireAt: 0,
//         prefix: '1',
//       }
//       await storage2.set('xy', fileStream, m)
//       const meta = await storage2.metadata('xy')
//       await storage2.del('xy')
//       tap.deepEqual(meta, m)
//     })
//     tc.test('adds prefix and expireAt', async function (tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/file2.txt'))
//       const m = {
//         dl: 1,
//         dlimit: 1,
//         metadata: 'bar2',
//         owner: 'bmo2',
//       }
//       await storage2.set('x', fileStream, m)
//       const meta = await storage2.metadata('x')
//       await storage2.del('x')
//       tap.deepEqual(meta, { ...m, prefix: '1', expireAt: 0 })
//     })
//     tc.end()
//   })
//   t.end()
// })
