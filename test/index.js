'use strict'
const test = require('tape')
const makeConcurrent = require('../')

function noop () {}
function wait (ms) { return new Promise((resolve) => setTimeout(resolve, ms)) }

test('invalid concurrency: -1', (t) => {
  t.throws(() => {
    makeConcurrent(noop, { concurrency: -1 })
  }, /^TypeError: Invalid concurrency value: -1$/)
  t.end()
})

test('concurrency is Infinity', async (t) => {
  let total = 0
  const fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  }, { concurrency: Infinity })

  fn(2)
  fn(4)
  fn(8)

  await wait(50)
  t.equal(total, 14)

  t.end()
})

test('concurrency is 1 (by default)', async (t) => {
  let total = 0
  const fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  })

  fn(2)
  fn(4)
  fn(8)

  await wait(10)
  t.equal(total, 2)

  await wait(100)
  t.equal(total, 6)

  await wait(100)
  t.equal(total, 14)

  t.end()
})

test('concurrency is 2', async (t) => {
  let total = 0
  const fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  }, { concurrency: 2 })

  fn(2)
  fn(4)
  fn(8)

  await wait(10)
  t.equal(total, 6)

  await wait(100)
  t.equal(total, 14)

  t.end()
})

test('check returned value', async (t) => {
  const fn = makeConcurrent((x) => {
    return x * 2
  })

  const ret = await fn(2)
  t.equal(ret, 4)
  t.end()
})

test('check error throwing', async (t) => {
  t.plan(1)

  const fn = makeConcurrent((x) => {
    throw new Error(x)
  })

  try {
    await fn('hey there')
  } catch (err) {
    t.true(/^Error: hey there$/.exec(err) !== null)
  }

  t.end()
})
