# search-indexer-algolia [![NPM version](https://img.shields.io/npm/v/search-indexer-algolia.svg?style=flat)](https://www.npmjs.com/package/search-indexer-algolia) [![NPM monthly downloads](https://img.shields.io/npm/dm/search-indexer-algolia.svg?style=flat)](https://npmjs.org/package/search-indexer-algolia) [![NPM total downloads](https://img.shields.io/npm/dt/search-indexer-algolia.svg?style=flat)](https://npmjs.org/package/search-indexer-algolia) [![Linux Build Status](https://img.shields.io/travis/doowb/search-indexer-algolia.svg?style=flat&label=Travis)](https://travis-ci.org/doowb/search-indexer-algolia) [![Windows Build Status](https://img.shields.io/appveyor/ci/doowb/search-indexer-algolia.svg?style=flat&label=AppVeyor)](https://ci.appveyor.com/project/doowb/search-indexer-algolia)

> base-search indexer to enable collecting and adding records to an algolia search index

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save search-indexer-algolia
```

**HEADS UP!**

> `SECRET_KEY` has been changed to `API_KEY` to reflect the naming conventions of the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) api. `SECRET_KEY` will still work but will be deprecrated and removed in the next major version.

## Usage

```js
var algolia = require('search-indexer-algolia');

var options = {
  APPLICATION_ID: '12345',
  API_KEY: 'xxxxx',
  index: 'my-index',
  collectFn: function(file, next) {
    // customize object being collected
    var obj = {
      objectID: file.key,
      key: file.key
    };
    return next(null, obj);
  }
};
app.search.indexer('algolia', algolia(options));
```

## API

### [indexer](index.js#L27)

Creates a new algolia indexer that may be used in [base-search](https://github.com/node-base/base-search).

**Params**

* `options` **{Object}**: Options for setting up the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) client and index.
* `options.APPLICATION_ID` **{String}**: algolia application id
* `options.API_KEY` **{String}**: algolia api key used for adding records to an index
* `options.index` **{String}**: algolia index to add records to
* `options.collectFn` **{Function}**: Custom collect function to use for creating records from file objects. See [collect](#collect) method for more information.
* `options.indexFn` **{Function}**: Custom index function used to add records to the algolia index. See [index](#index) method for more information.
* `returns` **{Object}**: Indexer instance to pass to [base-search](https://github.com/node-base/base-search).

**Example**

```js
var opts = {
  APPLICATION_ID: '12345',
  API_KEY: 'xxxxx'
};
app.search.indexer('algolia', algolia(opts));
```

### [.init](index.js#L62)

Initialize the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) client and index. The client will only be created the first time this method is called. This is called inside the [collect](#collect) and [index](#index) methods but may be called manually before using.

**Params**

* `options` **{Object}**: Options for setting up the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) client and index.
* `options.APPLICATION_ID` **{String}**: algolia application id
* `options.API_KEY` **{String}**: algolia api key used for adding records to an index
* `options.index` **{String}**: algolia index to add records to
* `options.collectFn` **{Function}**: Custom collect function to use for creating records from file objects. See [collect](#collect) method for more information.
* `options.indexFn` **{Function}**: Custom index function used to add records to the algolia index. See [index](#index) method for more information.
* `returns` **{Object}**: Indexer instance to pass to [base-search](https://github.com/node-base/base-search).

**Example**

```js
var indexer = algolia(opts);
app.search.indexer('algolia', indexer.init(opts));
```

### [.collect](index.js#L102)

This method is called when collecting records to be indexed. It will be called for each file coming through the stream created by `app.search.collect()`. If `options.collectFn` is a function, the function will be called using the `indexer` instance as the context. This provides access to the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) index by using `this.idx` inside the function.

**Params**

* `file` **{Object}**: File object passed in from [base-search](https://github.com/node-base/base-search)
* `next` **{Function}**: Callback function to return the customized record or `false` to indicate the file should be skipped.

**Example**

```js
// set a custom `collectFn` when creating the indexer
var opts = {
  ...
  collectFn: function(file, next) {
    if (!file.data.foo) {
      // passing `false` says to not collect this file
      return next(null, false);
    }
    return next(null, {objectID: file.key, key: file.key, title: file.title});
  }
};
app.search.indexer('algolia', algolia(opts));
```

### [.index](index.js#L138)

This method is called when indexing the collected files. It will be passed an object of files collect through the [collect](#collect) method. If `options.indexFn` is a function, the function will be called using the `indexer` instance as the context. This provides access to the [algoliasearch](https://www.algolia.com/doc/api-client/javascript/) index by using `this.idx` inside the function.

**Params**

* `files` **{Object}**: Files object passed in from [base-search](https://github.com/node-base/base-search).
* `options` **{Object}**: Options object passed in from [base-search](https://github.com/node-base/base-search).
* `cb` **{Function}**: Callback function passed in from [base-seaerch][] used to indicate that indexing has finished.

**Example**

```js
// set a custom `indexFn` when creating the indexer
var opts = {
  ...
  indexFn: function(files, options, cb) {
    var arr = Object.keys(files)
      .map(function(key) {
        return files[key];
      });

    // add the array of objects to the algolia index
    this.idx.addObjects(arr, cb);
  }
};
app.search.indexer('algolia', algolia(opts));
```

## About

### Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

Please read the [contributing guide](.github/contributing.md) for advice on opening issues, pull requests, and coding standards.

### Building docs

_(This project's readme.md is generated by [verb](https://github.com/verbose/verb-generate-readme), please don't edit the readme directly. Any changes to the readme must be made in the [.verb.md](.verb.md) readme template.)_

To generate the readme, run the following command:

```sh
$ npm install -g verbose/verb#dev verb-generate-readme && verb
```

### Running tests

Running and reviewing unit tests is a great way to get familiarized with a library and its API. You can install dependencies and run tests with the following command:

```sh
$ npm install && npm test
```

### Author

**Brian Woodward**

* [github/doowb](https://github.com/doowb)
* [twitter/doowb](https://twitter.com/doowb)

### License

Copyright © 2018, [Brian Woodward](https://github.com/doowb).
Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.7.0, on June 18, 2018._