function makeConcurrent (fn, { concurrency = 1 } = {}) {
  validateConcurrencyValue(concurrency)

  let count = 0
  const queue = []

  return async function (...args) {
    count += 1

    try {
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

module.exports = makeConcurrent

function validateConcurrencyValue (value) {
  const isValid = typeof value === 'number' && value > 0 && (value === Infinity || value % 1 === 0)
  if (!isValid) throw new TypeError(`Invalid concurrency value: ${value}`)
}

module.exports.byArguments = function makeConcurrentByArguments (fn, createKey = JSON.stringify) {
  const keys = new Map()
  return async (...args) => {
    const key = createKey(args)
    if (!keys.has(key)) keys.set(key, { count: 0, fn: makeConcurrent(fn) })

    const state = keys.get(key)
    try {
      state.count++
      return await state.fn(...args)
    } finally {
      state.count--
      if (state.count === 0) keys.delete(key)
    }
  }
}
