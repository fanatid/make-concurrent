import { Semaphore } from 'sync-primitives'

function type (obj) {
  return Object.prototype.toString.call(obj).slice(8, -1)
}

function createConcurrentFunction (fn, opts = {concurrency: 1}) {
  let sem = new Semaphore(Object(opts).concurrency)
  return function () {
    return sem.withLock(() => {
      return fn.apply(this, arguments)
    })
    .then((result) => { return result[1] })
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
