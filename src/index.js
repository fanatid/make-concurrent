import getCustomPromise from 'custom-promise-for-package'

export default getCustomPromise((Promise) => {
  return function makeConcurrent (fn, opts = {concurrency: 1}) {
    var concurrency = parseInt(Object(opts).concurrency, 10)
    if (isNaN(concurrency) || concurrency < 0) {
      concurrency = 1
    }

    var queue = []
    var launched = 0

    function queuePulse () {
      if ((concurrency === 0 || launched < concurrency) && queue.length > launched) {
        queue[launched]()
        launched += 1
      }
    }

    return function () {
      var args = new Array(arguments.length)
      for (let i = 0; i < args.length; ++i) {
        args[i] = arguments[i]
      }

      function onFinished () {
        launched -= 1
        queue.splice(queue.indexOf(currentResolve), 1)
        queuePulse()
      }

      var currentResolve
      return new Promise((resolve) => {
        currentResolve = resolve
        queue.push(currentResolve)
        queuePulse()
      })
      .then(() => {
        return fn.apply(this, args)
      })
      .then((value) => {
        onFinished()
        return value
      }, (reason) => {
        onFinished()
        throw reason
      })
    }
  }
})
