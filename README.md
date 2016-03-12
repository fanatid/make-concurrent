# make-concurrent

[![NPM Package](https://img.shields.io/npm/v/make-concurrent.svg?style=flat-square)](https://www.npmjs.org/package/make-concurrent)
[![Build Status](https://img.shields.io/travis/fanatid/make-concurrent.svg?branch=master&style=flat-square)](https://travis-ci.org/fanatid/make-concurrent)
[![Coverage Status](https://img.shields.io/coveralls/fanatid/make-concurrent.svg?style=flat-square)](https://coveralls.io/r/fanatid/make-concurrent)
[![Dependency status](https://img.shields.io/david/fanatid/make-concurrent.svg?style=flat-square)](https://david-dm.org/fanatid/make-concurrent#info=dependencies)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

If you have resource which requires exclusive or shared access try [make-concurrent](https://github.com/fanatid/make-concurrent) ;)

## Installation

```
npm install make-concurrent
```

## Example

```js
var fs = require('fs')
var makeConcurrent = require('make-concurrent')

var objdb = {}
var save = makeConcurrent(() => {
  return new Promise((resolve, reject) => {
    fs.writeFile('path-to-object-db', JSON.stringify(objdb), (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}, { concurrency: 1 })

var emitter = ... // any object that inherits EventEmitter
emitter.on('event-name', (key, value) => {
  objdb[key] = data
  save()
})
```

## License

Code released under [the MIT license](LICENSE).
