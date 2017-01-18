'use strict'
module.exports = function (fn, opts) {
  const concurrency = Object.assign({ concurrency: 1 }, opts).concurrency
  if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency <= 0) {
    throw new TypeError(`Invalid concurrency value: ${concurrency}`)
  }

  let count = 0
  const queue = []

  function next () {
    if (queue.length > 0) queue.shift().resolve()
    else count -= 1
  }

  return function () {
    let promise
    if (count >= concurrency) {
      promise = new Promise((resolve) => queue.push({ resolve }))
    } else {
      promise = Promise.resolve()
      count += 1
    }

    return promise
      .then(() => fn.apply(this, arguments))
      .then((ret) => {
        next()
        return ret
      }, (err) => {
        next()
        throw err
      })
  }
}
