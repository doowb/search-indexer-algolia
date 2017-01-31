'use strict';

require('mocha');
var assert = require('assert');
var algolia = require('../');

describe('search-indexer-algolia', function() {
  it('should export a function', function() {
    assert.equal(typeof algolia, 'function');
  });

  it('should create a new indexer instance', function() {
    var indexer = algolia();
    assert(indexer);
    assert.equal(typeof indexer, 'object');
    assert.equal(typeof indexer.collect, 'function');
    assert.equal(typeof indexer.index, 'function');
  });
});
