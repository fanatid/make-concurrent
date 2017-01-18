# make-concurrent

[![NPM Package](https://img.shields.io/npm/v/make-concurrent.svg?style=flat-square)](https://www.npmjs.org/package/make-concurrent)
[![Build Status](https://img.shields.io/travis/fanatid/make-concurrent.svg?branch=master&style=flat-square)](https://travis-ci.org/fanatid/make-concurrent)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Example

```js
const fs = require('fs')
const makeConcurrent = require('make-concurrent')

const objdb = {}
const save = makeConcurrent(() => {
  return new Promise((resolve, reject) => {
    fs.writeFile('path-to-object-db', JSON.stringify(objdb), (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}, { concurrency: 1 })

const emitter = ... // any object that inherits EventEmitter
emitter.on('event-name', (key, value) => {
  objdb[key] = data
  save()
})
```

## LICENSE

Code released under [the MIT license](LICENSE).
