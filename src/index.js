function type (obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

function createConcurrentFunction (fn, opts = {concurrency: 1}) {
  let concurrency = Object(opts).concurrency
  if (concurrency !== Infinity && (!isFinite(concurrency) || concurrency <= 0)) {
    concurrency = 1
  }

  let count = 0
  let queue = []

  return async function () {
    if (count >= concurrency) {
      await new Promise((resolve) => {
        queue.push({resolve: resolve})
      })
    }

    try {
      count += 1
      return await fn.apply(this, arguments)
    } finally {
      count -= 1
      if (queue.length > 0) {
        queue.shift().resolve()
      }
    }
  }
}

export default function makeConcurrent (target, name, descriptor, opts) {
  // call as function
  if (type(target) === 'Function' &&
      (type(name) === 'Object' || name === undefined) &&
      descriptor === undefined &&
      opts === undefined) {
    return createConcurrentFunction(target, name)
  }

  // call as decorator function
  if ((type(target) === 'Object' || target === undefined) &&
      name === undefined &&
      descriptor === undefined &&
      opts === undefined) {
    opts = target
    return function (target, name, descriptor) {
      makeConcurrent(target, name, descriptor, opts)
    }
  }

  // as decorator
  if ((type(target) === 'Function' || type(target) === 'Object') &&
      type(name) === 'String' &&
      type(descriptor) === 'Object' &&
      (type(opts) === 'Object' || opts === undefined)) {
    descriptor.value = makeConcurrent(descriptor.value, opts)
    return
  }

  throw new Error('Bad arguments')
}
