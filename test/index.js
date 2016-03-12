import 'babel-core/register'
import test from 'ava'
import makeConcurrent from '../src'

function noop () {}
function delay (ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

test('invalid concurrency: string', (t) => {
  t.throws(() => {
    makeConcurrent(noop, { concurrency: 'hello world' })
  }, /^TypeError: invalid concurrency: hello world$/)
})

test('invalid concurrency: NaN', (t) => {
  t.throws(() => {
    makeConcurrent(noop, { concurrency: NaN })
  }, /^TypeError: invalid concurrency: NaN$/)
})

test('invalid concurrency: 0', (t) => {
  t.throws(() => {
    makeConcurrent(noop, { concurrency: 0 })
  }, /^TypeError: invalid concurrency: 0$/)
})

test('concurrency is Infinity', async function (t) {
  let total = 0
  let fn = makeConcurrent((x) => {
    total += x
    return delay(100)
  }, {concurrency: Infinity})

  fn(2)
  fn(4)
  fn(8)

  await delay(50)
  t.same(total, 14)
})

test('concurrency is 1 (by default)', async function (t) {
  let total = 0
  let fn = makeConcurrent((x) => {
    total += x
    return delay(100)
  })

  fn(2)
  fn(4)
  fn(8)

  await delay(10)
  t.same(total, 2)
  await delay(100)
  t.same(total, 6)
  await delay(100)
  t.same(total, 14)
})

test('concurrency is 2', async function (t) {
  let total = 0
  let fn = makeConcurrent((x) => {
    total += x
    return delay(100)
  }, {concurrency: 2})

  fn(2)
  fn(4)
  fn(8)

  await delay(10)
  t.same(total, 6)
  await delay(100)
  t.same(total, 14)
})

test('check returned value', async function (t) {
  let fn = makeConcurrent((x) => {
    return x * 2
  })

  let val = await fn(2)
  t.same(val, 4)
})

test('check error throwing', (t) => {
  let fn = makeConcurrent((x) => {
    throw new Error(x)
  })

  t.throws(fn('hey there'), /^Error: hey there$/)
})
