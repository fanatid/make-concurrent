import getCustomPromise from 'custom-promise-for-package'

export default getCustomPromise((Promise) => {
  var Semaphore = require('sync-primitives')(Promise).Semaphore

  return function makeConcurrent (fn, opts = {concurrency: 1}) {
    var sem = new Semaphore(Object(opts).concurrency)
    return function () {
      return sem.withLock(() => {
        return fn.apply(this, arguments)
      })
      .then((result) => { return result[1] })
    }
  }
})
