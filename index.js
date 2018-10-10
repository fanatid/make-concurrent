module.exports = function (fn, opts) {
  const concurrency = Object.assign({ concurrency: 1 }, opts).concurrency
  if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency <= 0) {
    throw new TypeError(`Invalid concurrency value: ${concurrency}`)
  }

  let count = 0
  const queue = []

  return async function (...args) {
    try {
      count += 1
      if (count > concurrency) {
        await new Promise((resolve) => queue.push({ resolve }))
      }

      return await fn(...args)
    } finally {
      count -= 1
      if (queue.length > 0) queue.shift().resolve()
    }
  }
}
