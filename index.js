'use strict';

var each = require('async-each');
var extend = require('extend-shallow');
var algolia = require('algoliasearch');

/**
 * Creates a new algolia indexer that may be used in [base-search][].
 *
 * ```js
 * var opts = {
 *   APPLICATION_ID: '12345',
 *   API_KEY: 'xxxxx'
 * };
 * app.search.indexer('algolia', algolia(opts));
 * ```
 * @param  {Object}   `options` Options for setting up the [algoliasearch][] client and index.
 * @param  {String}   `options.APPLICATION_ID` algolia application id
 * @param  {String}   `options.API_KEY` algolia api key used for adding records to an index
 * @param  {String}   `options.index` algolia index to add records to
 * @param  {Function} `options.collectFn` Custom collect function to use for creating records from file objects. See [collect](#collect) method for more information.
 * @param  {Function} `options.indexFn` Custom index function used to add records to the algolia index. See [index](#index) method for more information.
 * @return {Object} Indexer instance to pass to [base-search][].
 * @api public
 */

module.exports = function indexer(options) {
  return new Indexer(options);
};

/**
 * Create a new instance of the Indexer
 *
 * ```js
 * var indexer = new Indexer(opts);
 * ```
 * @param {Object} `options` Options to pass to algoliasearch
 */

function Indexer(options) {
  this.options = extend({}, options);
}

/**
 * Initialize the [algoliasearch][] client and index. The client will only be created the first time this method is called.
 * This is called inside the [collect](#collect) and [index](#index) methods but may be called manually before using.
 *
 * ```js
 * var indexer = algolia(opts);
 * app.search.indexer('algolia', indexer.init(opts));
 * ```
 * @param  {Object}   `options` Options for setting up the [algoliasearch][] client and index.
 * @param  {String}   `options.APPLICATION_ID` algolia application id
 * @param  {String}   `options.API_KEY` algolia api key used for adding records to an index
 * @param  {String}   `options.index` algolia index to add records to
 * @param  {Function} `options.collectFn` Custom collect function to use for creating records from file objects. See [collect](#collect) method for more information.
 * @param  {Function} `options.indexFn` Custom index function used to add records to the algolia index. See [index](#index) method for more information.
 * @return {Object} Indexer instance to pass to [base-search][].
 * @api public
 */

Indexer.prototype.init = function(options) {
  if (this.client) {
    return this;
  }

  var opts = extend({}, this.options, options);
  if (!opts.index) {
    throw new Error('expected "index" to be on "options"');
  }

  this.client = algolia(opts.APPLICATION_ID, opts.API_KEY || opts.SECRET_KEY);
  this.idx = this.client.initIndex(opts.index);
  return this;
};

/**
 * This method is called when collecting records to be indexed. It will be called for each file
 * coming through the stream created by `app.search.collect()`. If `options.collectFn` is a function,
 * the function will be called using the `indexer` instance as the context. This provides access to
 * the [algoliasearch][] index by using `this.idx` inside the function.
 *
 * ```js
 * // set a custom `collectFn` when creating the indexer
 * var opts = {
 *   ...
 *   collectFn: function(file, next) {
 *     if (!file.data.foo) {
 *       // passing `false` says to not collect this file
 *       return next(null, false);
 *     }
 *     return next(null, {objectID: file.key, key: file.key, title: file.title});
 *   }
 * };
 * app.search.indexer('algolia', algolia(opts));
 * ```
 * @param  {Object} `file` File object passed in from [base-search][]
 * @param  {Function} `next` Callback function to return the customized record or `false` to indicate the file should be skipped.
 * @api public
 */

Indexer.prototype.collect = function(file, next) {
  this.init();
  if (this.options && typeof this.options.collectFn === 'function') {
    return this.options.collectFn.call(this, file, next);
  }
  next(null, extend({objectID: file.key}, file));
};

/**
 * This method is called when indexing the collected files. It will be passed an object of files collect
 * through the [collect](#collect) method. If `options.indexFn` is a function,
 * the function will be called using the `indexer` instance as the context. This provides access to
 * the [algoliasearch][] index by using `this.idx` inside the function.
 *
 * ```js
 * // set a custom `indexFn` when creating the indexer
 * var opts = {
 *   ...
 *   indexFn: function(files, options, cb) {
 *     var arr = Object.keys(files)
 *       .map(function(key) {
 *         return files[key];
 *       });
 *
 *     // add the array of objects to the algolia index
 *     this.idx.addObjects(arr, cb);
 *   }
 * };
 * app.search.indexer('algolia', algolia(opts));
 * ```
 * @param  {Object}   `files` Files object passed in from [base-search][].
 * @param  {Object}   `options` Options object passed in from [base-search][].
 * @param  {Function} `cb` Callback function passed in from [base-seaerch][] used to indicate that indexing has finished.
 * @api public
 */

Indexer.prototype.index = function(files, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  this.init(options);
  var opts = extend({}, this.options, options);
  if (typeof opts.indexFn === 'function') {
    return opts.indexFn.apply(this, arguments);
  }

  var self = this;
  each(Object.keys(files), function(key, next) {
    if (files.hasOwnProperty(key)) {
      self.idx.addObject(files[key], next);
      return;
    }
    next();
  }, cb);
};
