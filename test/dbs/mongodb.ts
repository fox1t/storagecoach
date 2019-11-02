import { MongoMemoryServer } from 'mongodb-memory-server'
import { test } from 'tap'
import { createReadStream } from 'fs'
import { tmpdir } from 'os'
import { join, sep } from 'path'
import Storage from '../../src'
import StorageConfig from '../../src/config'
import { Readable } from 'stream'
import { randomBytes } from 'crypto'

test('MongoDB local storage.', async function(t) {
  const mongoServer = new MongoMemoryServer()
  const databaseHost = await mongoServer.getConnectionString()

  const config: StorageConfig = {
    env: 'development',
    databaseType: 'mongodb',
    databaseHost,
    databaseCollection: 'storagecoachFiles',
    storageType: 'fs',
    storageUri: `${tmpdir()}${sep}storagecoach-${randomBytes(4).toString('hex')}`,
  }

  const storage = Storage<{ foo: string }>(config)

  t.test('ttl', function(tc) {
    tc.test('returns milliseconds remaining', async function(tap) {
      tap.plan(1)
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      const time = 40
      await storage.set('x', fileStream, { foo: 'bar' }, time)
      const ms = await storage.ttl('x')
      tap.equal(ms <= time * 1000, true)
    })
    tc.end()
  })

  t.test('length', function(tc) {
    tc.test('returns the file size', async function(tap) {
      tap.plan(1)
      const len = await storage.length('x')
      tap.equal(len, 435448)
    })
    tc.end()
  })
  t.test('get', function(tc) {
    tc.test('returns a stream', async function(tap) {
      tap.plan(1)
      const s = await storage.get('x')
      tap.equal(s instanceof Readable, true)
    })
    tc.end()
  })

  t.test('set', function(tc) {
    tc.test('sets expiration to expire time', async function(tap) {
      tap.plan(1)
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      const seconds = 100
      await storage.set('x', fileStream, { foo: 'bar' }, seconds)
      const s = await storage.db.ttl('x')
      await storage.del('x')
      tap.equal(Math.ceil(s) <= seconds, true)
    })

    tc.test('adds right prefix based on expire time', async function(tap) {
      tap.plan(3)
      let fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('x', fileStream, { foo: 'bar' }, 300)
      const pathX = await storage.getPrefixedId('x')
      tap.equal(pathX, '1-x')
      await storage.del('x')

      fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('y', fileStream, { foo: 'bar' }, 86400)
      const pathY = await storage.getPrefixedId('y')
      tap.equal(pathY, '1-y')
      await storage.del('y')

      fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('z', fileStream, { foo: 'bar' }, 86400 * 7)
      const pathZ = await storage.getPrefixedId('z')
      tap.equal(pathZ, '7-z')
      await storage.del('z')
    })

    tc.test('sets metadata', async function(tap) {
      tap.plan(1)
      const m = { foo: 'bar' }
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('x', fileStream, m)
      const meta = await storage.db.get<{ foo: string }>('x')
      delete meta!.prefix
      await storage.del('x')
      tap.deepEqual({ foo: meta!.foo }, m)
    })
    tc.end()
  })

  t.test('setField', function(tc) {
    tc.test('works', async function(tap) {
      tap.plan(1)
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('x', fileStream)
      storage.setField('x', 'y', 'z')
      const z = await storage.db.get('x', 'y')
      tap.equal(z, 'z')
      await storage.del('x')
    })
    tc.end()
  })

  t.test('del', function(tc) {
    tc.test('works', async function(tap) {
      tap.plan(1)
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      await storage.set('x', fileStream, { foo: 'bar' })
      await storage.del('x')
      const meta = await storage.metadata('x')
      tap.equal(meta, null)
    })
    tc.end()
  })

  t.test('ping', function(tc) {
    tc.test('works', async function(tap) {
      await storage.ping()
      tap.pass()
    })
    tc.end()
  })

  t.test('metadata', function(tc) {
    const storage2 = Storage(config)
    tc.test('returns all metadata fields', async function(tap) {
      tap.plan(1)
      const fileStream = createReadStream(join(__dirname, '../files/storagecoach.png'))
      const m = {
        dl: 1,
        dlimit: 1,
        metadata: 'bar',
        owner: 'bmo',
      }
      await storage2.set('x', fileStream, m)
      const meta = await storage2.metadata('x')
      await storage2.del('x')
      tap.deepEqual(meta, { ...m, prefix: '1', expireAt: 0 })
    })
    tc.end()
    tc.tearDown(() => {
      storage2.close()
    })
  })
  t.end()
  t.tearDown(() => {
    storage.close()
    mongoServer.stop()
  })
})
