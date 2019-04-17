module.exports = function (fn, opts) {
  const options = Object.assign({ concurrency: 1 }, opts)
  const concurrency = options.concurrency
  const byArguments = options.byArguments
  if (typeof concurrency !== 'number' || isNaN(concurrency) || concurrency <= 0) {
    throw new TypeError(`Invalid concurrency value: ${concurrency}`)
  }

  const defaultCache = {
    count: 0,
    queue: []
  }
  const byArgsCache = {}

  return async function (...args) {
    let cacheToUse = defaultCache
    if (byArguments) {
      const cacheKey = JSON.stringify(args)
      if (byArgsCache[cacheKey]) {
        cacheToUse = byArgsCache[cacheKey]
      } else {
        byArgsCache[cacheKey] = { count: 0, queue: [] }
      }
    }
    try {
      cacheToUse.count += 1
      console.log(cacheToUse)
      if (cacheToUse.count > concurrency) {
        await new Promise((resolve) => cacheToUse.queue.push({ resolve }))
      }

      return await fn(...args)
    } finally {
      cacheToUse.count -= 1
      if (cacheToUse.queue.length > 0) cacheToUse.queue.shift().resolve()
    }
  }
}
