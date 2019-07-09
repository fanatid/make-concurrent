module.exports = function (fn, { concurrency = 1 } = {}) {
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

function validateConcurrencyValue (value) {
  const isValid = typeof value === 'number' && value > 0 && (value === Infinity || value % 1 === 0)
  if (!isValid) throw new TypeError(`Invalid concurrency value: ${value}`)
}
