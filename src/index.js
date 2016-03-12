export default function makeConcurrent (fn, opts = {concurrency: 1}) {
  let concurrency = Object(opts).concurrency
  if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency <= 0) {
    throw new TypeError(`invalid concurrency: ${concurrency}`)
  }

  let count = 0
  let queue = []

  function next () {
    if (queue.length > 0) queue.shift().resolve()
    else count -= 1
  }

  return function () {
    let qPromise
    if (count >= concurrency) {
      qPromise = new Promise((resolve) => {
        queue.push({ resolve })
      })
    } else {
      qPromise = Promise.resolve()
      count += 1
    }

    return qPromise
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
