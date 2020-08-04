/**
 * context.js
 * 
 * @see https://github.com/gulpjs/vinyl/blob/master/index.js
 * sobird<i@sobird.me> at 2020/08/03 18:19:25 created.
 */
const crypto = require('crypto');
const util = require('util');

module.exports = {
  get path() {
    return this.vfs.path;
  },

  set path(val) {
    this.vfs.path = val;
  },

  get content() {
    return this.vfs.contents;
  },

  set content(val) {
    this.vfs.contents = val;
  },

  get md5 () {
    const md5sum = crypto.createHash('md5');
    md5sum.update(this.vfs.contents);
    return md5sum.digest('hex');
  },

  /**
   * Default error handling.
   *
   * @param {Error} err
   */
  onerror(err) {
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (null == err) return;

    if (!(err instanceof Error)) err = new Error(util.format('non-error thrown: %j', err));


    // delegate
    this.mix.emit('error', err, this);

    return err;
  }
}