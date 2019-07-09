# make-concurrent

[![Build Status](https://img.shields.io/travis/fanatid/make-concurrent.svg?branch=master&style=flat-square)](https://travis-ci.org/fanatid/make-concurrent)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

  - [What this is it?](#what-this-is-it)
  - [Installation](#installation)
  - [Where make-concurrent can be used?](#where-make-concurrent-can-be-used)
  - [How make-concurrent work?](#how-make-concurrent-work)
  - [Examples](#examples)
    - [Limited acces by API key](#limited-acces-by-api-key)
    - [Safe work with shared state](#safe-work-with-shared-state)
  - [LICENSE](#license)

## What this is it?

`make-concurrent` is a function which create function with limited parallel execution of passed function according with passed `concurrency` option (`1` by default).

It's not replacement of [lodash.debounce](https://lodash.com/docs#debounce) / [lodash.throttle](https://lodash.com/docs#throttle). Created function called immediately if current executed functions not excess `concurrency` option, otherwise call will be blocked until previous called functions not finished.

`make-concurrent` functions does not make any sense for synchronous functions, because JS can not execute more than 1 same synchronous function at one time, it's can be useful only for async functions.

Callbacks are not supported, [async functions](https://node.green/#ES2017-features-async-functions) with us from [Node v7.6.0](https://nodejs.org/en/blog/release/v7.6.0/) (2017-02-22), please use it.

## Installation

[npm](https://www.npmjs.com/):

```bash
npm install https://github.com/fanatid/make-concurrent
```

[yarn](https://yarnpkg.com/):

```bash
yarn add https://github.com/fanatid/make-concurrent
```

By default `npm` / `yarn` will install code from `master` branch. If you want specified version, just add some branch name / commit hash / tag and the end of URL. See [Yarn add](https://yarnpkg.com/lang/en/docs/cli/add/) or [npm install](https://docs.npmjs.com/cli/install) for details about installing package from git repo.

## Where make-concurrent can be used?

Anywhere where you need limited access to some resource.

## How make-concurrent work?

When we call function created by `make-concurrent` counter of called functions increased by `1`, then increased counter compared with `concurrency` option, if counter is greater than `concurrency` then we create `Promise`, push `resolve` function to queue ([FIFO](https://en.wikipedia.org/wiki/FIFO_(computing_and_electronics))) and wait while this `Promise` will be resolved, before call original function. When execution of original function will be finished we decrease counter on `1` and check queue, if queue length is not zero we take first item and call it, which resolve `Promise` and original function will be called again.

All code is less than 30 lines, just [check it](index.js). This will take 2 minutes, but will give better understanding how `make-concurrent` works and how can be used effectively.

## Examples

#### Limited acces by API key

Assume you need make requests to some API, but this API have limit of simultaneous requests by API key.

```js
const makeConcurrent = require('make-concurrent')
const fetch = require('node-fetch')

async function request (user) {
  return fetch(`https://example.org/getinfo?user=${user}&apikey=${process.env.API_KEY}`)
}

module.exports = makeConcurrent(request, { concurrency: 3 })
```

Now only 3 `request` function will work at one moment.

#### Safe work with shared state

Sometimes we have state and need work with it from async functions which can be executed at one time.

```js
const makeConcurrent = require('make-concurrent')

const state = {}
async function unsafeUpdate (user) {
  const currentValue = state[user] === undefined ? 0 : state[user]
  const newValue = await getNewValue(user, currentValue)
  state[user] = newValue
}

const safeUpdate = makeConcurrent(unsafeChange)
// safeUpdate('alice')
```

While `safeUpdate` going to be safe function for working with `state`, it's good as general approach. But here state changed for specified user, so we can optimize it:

```js
const makeConcurrent = require('make-concurrent')

const state = {}
async function unsafeUpdate (user) {
  const currentValue = state[user] === undefined ? 0 : state[user]
  const newValue = await getNewValue(user, currentValue)
  state[user] = newValue
}

const fns = {}
async function safeUpdate (user) {
  if (!fns[user]) fns[user] = makeConcurrent(unsafeChange)
  return fns[user](user)
}

// safeUpdate('alice')
```

## LICENSE [MIT](LICENSE)
