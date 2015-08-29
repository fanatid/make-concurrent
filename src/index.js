import { Semaphore } from 'sync-primitives'

export default function (fn, opts = {concurrency: 1}) {
  let sem = new Semaphore(Object(opts).concurrency)
  return function () {
    return sem.withLock(() => {
      return fn.apply(this, arguments)
    })
    .then((result) => { return result[1] })
  }
}
