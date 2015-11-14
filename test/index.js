import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import makeConcurrent from '../src'

chai.use(chaiAsPromised)
let expect = chai.expect

function runTests (Promise) {
  function pdelay (delay) {
    return new Promise((resolve) => { setTimeout(resolve, delay) })
  }

  it('as decorator', async () => {
    let obj = {
      @makeConcurrent
      fn (x) { return x * 2 }
    }

    let val = await obj.fn(2)
    expect(val).to.equal(4)
  })

  it('as decorator with concurrency', async () => {
    let obj = {
      @makeConcurrent({concurrency: 2})
      fn (x) { return x * 2 }
    }

    let val = await obj.fn(2)
    expect(val).to.equal(4)
  })

  it('concurrency is Infinity', async () => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: Infinity})

    expect(total).to.equal(0)

    fn(2)
    fn(4)
    fn(8)

    await pdelay(50)
    expect(total).to.equal(14)
  })

  it('concurrency is 1', async () => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    })

    expect(total).to.equal(0)

    fn(2)
    fn(4)
    fn(8)

    await pdelay(25)
    expect(total).to.equal(2)
    await pdelay(100)
    expect(total).to.equal(6)
    await pdelay(100)
    expect(total).to.equal(14)
  })

  it('concurrency is 2', async () => {
    let total = 0
    let fn = makeConcurrent((x) => {
      total += x
      return pdelay(100)
    }, {concurrency: 2})

    expect(total).to.equal(0)

    fn(2)
    fn(4)
    fn(8)

    await pdelay(25)
    expect(total).to.equal(6)
    await pdelay(100)
    expect(total).to.equal(14)
  })

  it('returned value', async () => {
    let fn = makeConcurrent((x) => {
      return x * 2
    })

    let val = await fn(2)
    expect(val).to.equal(4)
  })

  it('throw error', () => {
    let fn = makeConcurrent((x) => {
      throw new Error(x)
    })

    expect(fn('true')).to.be.rejectedWith(Error, 'true')
  })

  it('throw Error', () => {
    let fn = () => { makeConcurrent(1) }
    expect(fn).to.throw(/Bad arguments/)
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
