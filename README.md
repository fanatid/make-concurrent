# make-concurrent

[![build status](https://img.shields.io/travis/fanatid/make-concurrent.svg?branch=master&style=flat-square)](http://travis-ci.org/fanatid/make-concurrent)
[![Coverage Status](https://img.shields.io/coveralls/fanatid/make-concurrent.svg?style=flat-square)](https://coveralls.io/r/fanatid/make-concurrent)
[![Dependency status](https://img.shields.io/david/fanatid/make-concurrent.svg?style=flat-square)](https://david-dm.org/fanatid/make-concurrent#info=dependencies)
[![Dev Dependency status](https://img.shields.io/david/fanatid/make-concurrent.svg?style=flat-square)](https://david-dm.org/fanatid/make-concurrent#info=devDependencies)

[![NPM](https://nodei.co/npm/make-concurrent.png?downloads=true)](https://www.npmjs.com/package/make-concurrent)
[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

If you have resource which requires exclusive or shared access try [make-concurrent](https://github.com/fanatid/make-concurrent) ;)

## Installation

```
npm install make-concurrent
```

## Example

```js
var Promise = require('bluebird')
var makeConcurrent = require('make-concurrent')

var user = {balance: 100}

var allowOverdraft = function (amount) {
  // simulate request to remote service ...
  return Promise.delay(1000).then(function () { return amount > -50 })
}

var http = require('http')
var url = require('url')
http.createServer(makeConcurrent(function (req, res) {
  var data = url.parse(req.url).query

  var newBalance = user.balance
  if (data.action === 'add') { newBalance += data.amount }
  if (data.access === 'sub') { newBalance -= data.amount }

  allowOverdraft(newBalance)
    .then(function (allowed) {
      res.writeHead(200, {'Content-Type': 'text/plain'})

      if (allowed === true) {
        user.balance = newBalance
        res.write('Allowed!')
      } else {
        res.write('Disallowed!')
      }

      res.write('\nCurrent balance: ' + user.balance)
      res.end()

    }, function (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.write('Error: ' + err)
      res.end()
    })

})).listen(3000)
```

## License

Code released under [the MIT license](https://github.com/fanatid/make-concurrent/blob/master/LICENSE).
