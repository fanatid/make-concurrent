import { expect } from 'chai'

import makeConcurrent from '../src'

function runTests (Promise) {
  function pdelay (delay) {
    return new Promise((resolve) => { setTimeout(resolve, delay) })
  }

  it('concurrency is Infinity', (done) => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: Infinity})

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(14) }, 50)
    setTimeout(done, 150)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 1', (done) => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    })

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(2) }, 50)
    setTimeout(() => { expect(total).to.equal(6) }, 150)
    setTimeout(() => { expect(total).to.equal(14) }, 250)
    setTimeout(done, 350)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 2', (done) => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: 2})

    expect(total).to.equal(0)
    setTimeout(() => { expect(total).to.equal(6) }, 50)
    setTimeout(() => { expect(total).to.equal(14) }, 150)
    setTimeout(done, 250)

    fn(2)
    fn(4)
    fn(8)
  })

  it('returned value', async () => {
    let fn = makeConcurrent((x) => {
      return x * 2
    })

    let val = await fn(2)
    expect(val).to.equal(4)
  })

  it('throw error', async () => {
    let fn = makeConcurrent((x) => {
      throw new Error(x)
    })

    try {
      await fn('true')
      throw new Error('false')
    } catch (err) {
      expect(err).to.be.instanceof(Error)
      expect(err.message).to.equal('true')
    }
  })
}

let promises = {
  'Promise': Promise,
  'bluebird': require('bluebird'),
  // 'Q': require('q'),
  'lie': require('lie')
}

for (let key of Object.keys(promises)) {
  describe(key, () => { runTests(promises[key]) })
}
