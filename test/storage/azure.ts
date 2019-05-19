// import { test } from 'tap'
// import { createReadStream } from 'fs'
// import { join } from 'path'
// import Storage, { StorageConfig } from '../../src'
// import { MetadataObject } from '../../src/lib/metadata'
// import { Readable } from 'stream'

// const config: StorageConfig = {
//   env: 'development',
//   databaseHost: 'localhost', // mock-redis
//   expireSeconds: 20,
//   storageType: 'az',
//   storageUser: 'storagecoachtest',
//   storageKey: '',
//   storageUri: 'storagecoach',
// }

// test('Redis Azure Blob container', function(t) {
//   const storage = Storage(config)

//   t.test('ttl', function(tc) {
//     tc.test('returns milliseconds remaining', async function(tap) {
//       tap.plan(1)
//       const time = 40
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('x', fileStream, { foo: 'bar' }, time)
//       const ms = await storage.ttl('x')
//       tap.equal(ms, time * 1000)
//     })
//     tc.end()
//   })

//   t.test('length', function(tc) {
//     tc.test('returns the file size', async function(tap) {
//       tap.plan(1)
//       const len = await storage.length('x')
//       tap.equal(len, 1545)
//     })
//     tc.end()
//   })
//   t.test('get', function(tc) {
//     tc.test('returns a stream', async function(tap) {
//       tap.plan(1)
//       const s = await storage.get('x')
//       await storage.del('x')
//       tap.equal(s instanceof Readable, true)
//     })
//     tc.end()
//   })

//   t.test('set', function(tc) {
//     tc.test('sets expiration to expire time', async function(tap) {
//       tap.plan(1)
//       const seconds = 100
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('y', fileStream, { foo: 'bar' }, seconds)
//       const s = await storage.db.ttl('y')
//       await storage.del('y')
//       tap.equal(Math.ceil(s), seconds)
//     })

//     tc.test('adds right prefix based on expire time', async function(tap) {
//       tap.plan(3)
//       let fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('x', fileStream, { foo: 'bar' }, 300)
//       const pathX = await storage.getPrefixedId('x')
//       tap.equal(pathX, '1-x')
//       await storage.del('x')

//       fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('y', fileStream, { foo: 'bar' }, 86400)
//       const pathY = await storage.getPrefixedId('y')
//       tap.equal(pathY, '1-y')
//       await storage.del('y')

//       fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('z', fileStream, { foo: 'bar' }, 86400 * 7)
//       const pathZ = await storage.getPrefixedId('z')
//       tap.equal(pathZ, '7-z')
//       await storage.del('z')
//     })

//     tc.test('sets metadata', async function(tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       const m = { foo: 'bar' }
//       await storage.set('x', fileStream, m)
//       const meta = (await storage.db.get('x')) as MetadataObject
//       delete meta.prefix
//       await storage.del('x')
//       tap.deepEqual(meta, m)
//     })
//     tc.end()
//   })

//   t.test('setField', function(tc) {
//     tc.test('works', async function(tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('x', fileStream)
//       storage.setField('x', 'y', 'z')
//       const z = await storage.db.get('x', 'y')
//       tap.equal(z, 'z')
//       await storage.del('x')
//     })
//     tc.end()
//   })

//   t.test('del', function(tc) {
//     tc.test('works', async function(tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       await storage.set('x', fileStream, { foo: 'bar' })
//       await storage.del('x')
//       const meta = await storage.metadata('x')
//       tap.equal(meta, null)
//     })
//     tc.end()
//   })

//   t.test('ping', function(tc) {
//     tc.test('works', async function(tap) {
//       await storage.ping()
//       tap.pass()
//     })
//     tc.end()
//   })

//   t.test('metadata', function(tc) {
//     tc.test('returns all metadata fields', async function(tap) {
//       tap.plan(1)
//       const fileStream = createReadStream(join(__dirname, '../files/logo.png'))
//       const m = {
//         pwd: true,
//         dl: 1,
//         dlimit: 1,
//         auth: 'foo',
//         metadata: 'bar',
//         nonce: 'baz',
//         owner: 'bmo',
//       }
//       await storage.set('x', fileStream, m)
//       const meta = await storage.metadata('x')
//       await storage.del('x')
//       tap.deepEqual(meta, m)
//     })
//     tc.end()
//   })
//   t.end()
// })
