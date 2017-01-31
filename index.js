'use strict';

var each = require('async-each');
var extend = require('extend-shallow');
var algolia = require('algoliasearch');

module.exports = function(options) {
  return new Indexer(options);
};

function Indexer(options) {
  this.options = extend({}, options);
}

Indexer.prototype.init = function(options) {
  if (this.client) return;

  var opts = extend({}, this.options, options);
  if (!opts.index) {
    throw new Error('expected "index" to be on "options"');
  }

  this.client = algolia(opts.APPLICATION_ID, opts.SECRET_KEY);
  this.idx = this.client.initIndex(opts.index);
};

Indexer.prototype.collect = function(file, next) {
  this.init();
  if (this.options && typeof this.options.collectFn === 'function') {
    return this.options.collectFn.call(this, file, next);
  }
  next(null, extend({objectID: file.key}, file));
};

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
