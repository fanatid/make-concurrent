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

test('concurrency is Infinity', (t) => {
  let total = 0
  const fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  }, { concurrency: Infinity })

  fn(2)
  fn(4)
  fn(8)

  wait(50)
    .then(() => {
      t.equal(total, 14)
      t.end()
    })
})

test('concurrency is 1 (by default)', (t) => {
  let total = 0
  const fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  })

  fn(2)
  fn(4)
  fn(8)

  wait(10)
    .then(() => {
      t.equal(total, 2)
      return wait(100)
    })
    .then(() => {
      t.equal(total, 6)
      return wait(100)
    })
    .then(() => {
      t.equal(total, 14)
      t.end()
    })
})

test('concurrency is 2', (t) => {
  let total = 0
  let fn = makeConcurrent((x) => {
    total += x
    return wait(100)
  }, { concurrency: 2 })

  fn(2)
  fn(4)
  fn(8)

  wait(10)
    .then(() => {
      t.equal(total, 6)
      return wait(100)
    })
    .then(() => {
      t.equal(total, 14)
      t.end()
    })
})

test('check returned value', (t) => {
  const fn = makeConcurrent((x) => {
    return x * 2
  })

  fn(2)
    .then((ret) => {
      t.equal(ret, 4)
      t.end()
    })
})

test('check error throwing', (t) => {
  const fn = makeConcurrent((x) => {
    throw new Error(x)
  })

  fn('hey there')
    .catch((err) => {
      t.true(/^Error: hey there$/.exec(err) !== null)
      t.end()
    })
})
