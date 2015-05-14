/* global describe, it */
var expect = require('chai').expect
var bluebird = require('bluebird')

function runTests (Promise) {
  var makeConcurrent = require('./index')(Promise)

  function pdelay (delay) {
    return new Promise(function (resolve) {
      setTimeout(resolve, delay)
    })
  }

  it('concurrency is 0', function (done) {
    var total = 0
    var fn = makeConcurrent(function (x) {
      total += x
      return pdelay(100)
    }, {concurrency: 0})

    expect(total).to.equal(0)
    setTimeout(function () { expect(total).to.equal(14) }, 50)
    setTimeout(done, 150)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 1', function (done) {
    var total = 0
    var fn = makeConcurrent(function (x) {
      total += x
      return pdelay(100)
    })

    expect(total).to.equal(0)
    setTimeout(function () { expect(total).to.equal(2) }, 50)
    setTimeout(function () { expect(total).to.equal(6) }, 150)
    setTimeout(function () { expect(total).to.equal(14) }, 250)
    setTimeout(done, 350)

    fn(2)
    fn(4)
    fn(8)
  })

  it('concurrency is 2', function (done) {
    var total = 0
    var fn = makeConcurrent(function (x) {
      total += x
      return pdelay(100)
    }, {concurrency: 2})

    expect(total).to.equal(0)
    setTimeout(function () { expect(total).to.equal(6) }, 50)
    setTimeout(function () { expect(total).to.equal(14) }, 150)
    setTimeout(done, 250)

    fn(2)
    fn(4)
    fn(8)
  })

  it('returned value', function (done) {
    var fn = makeConcurrent(function (x) {
      return x * 2
    })

    bluebird.try(function () {
      return fn(2)
    })
    .asCallback(function (err, val) {
      expect(err).to.be.null
      expect(val).to.equal(4)
      done()
    })
  })

  it('throw error', function (done) {
    var fn = makeConcurrent(function (x) {
      throw new Error(x)
    })

    bluebird.try(function () {
      return fn('msg!')
    })
    .asCallback(function (err, val) {
      expect(err).to.be.instanceof(Error)
      expect(err.message).to.equal('msg!')
      expect(val).to.be.undefined
      done()
    })
  })
}

var promises = {
  'Promise': (function () { try { return Promise } catch (err) { return } })(),
  'bluebird': require('bluebird'),
  // 'Q': require('q'),
  'lie': require('lie'),
  'es6-promise polyfill': require('es6-promise').Promise
}

Object.keys(promises).forEach(function (key) {
  var kdescribe = promises[key] === undefined
                    ? xdescribe
                    : describe

  kdescribe(key, function () {
    runTests(promises[key])
  })
})
