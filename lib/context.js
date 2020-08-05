/**
 * context.js
 * 
 * @see https://github.com/gulpjs/vinyl/blob/master/index.js
 * sobird<i@sobird.me> at 2020/08/03 18:19:25 created.
 */
const crypto = require('crypto');
const path = require('path');
const util = require('util');
const url = require('url');
const _ = require('lodash');
const replacePathVariables = require('./varpath');

module.exports = {
  /**
   * Return file stat
   * 
   * @returns {Object}
   */
  get stat() {
    return this.vfs.stat;
  },

  /**
   * Return file cwd
   * 
   * @returns {String}
   */
  get cwd() {
    return this.vfs.cwd;
  },

  /**
   * Return file base dir
   * 
   * @returns {String}
   */
  get base() {
    return this.vfs.base;
  },

  /**
   * 获取不带后缀的文件名
   * 
   * @returns {String}
   */
  get name() {
    return this.vfs.stem;
  },

  /**
   * 设置不带后缀的文件名
   * 
   * @param {String}
   */
  set name(val) {
    const name = replacePathVariables(val, this);
    this.vfs.stem = name;
  },

  /**
   * 获取带有后缀的文件名
   * 
   * @returns {String}
   */
  get basename() {
    return this.vfs.basename;
  },

  /**
   * 设置带有后缀的文件名, 支持变量模板
   * 
   * @param {String}
   */
  set basename(val) {
    const basename = replacePathVariables(val, this);
    this.vfs.basename = basename;
  },

  /**
   * Return file path
   * 
   * @returns {String}
   */
  get filename() {
    return path.relative(this.base, this.realpath);;
  },

  /**
   * Set file path
   * 
   * @param {String} val file path
   */
  set filename(val) {
    const filename = replacePathVariables(val, this);
    this.vfs.path = path.join(this.base, filename);
  },

  /**
   * Return file realpath
   * 
   * @returns {String}
   */
  get realpath() {
    return this.vfs.path;
  },

  /**
   * Set file realpath
   * 
   * @param {String} val file path
   */
  set realpath(val) {
    this.vfs.path = val;
  },

  /**
   * Return file extname
   * 
   * @param {String} 
   */
  get extname() {
    return this.vfs.extname;
  },

  /**
   * Set file extname
   * 
   * @param {String} val file extname
   */
  set extname(val) {
    this.vfs.extname = val;
  },

  /**
   * Return file dirname
   * 
   * @return {String}
   */
  get dirname() {
    return this.vfs.dirname;
  },

  /**
   * Set file dirname
   * 
   * @param {String} val
   */
  set dirname(val) {
    this.vfs.dirname = val;
  },

  /**
   * Return file content
   * 
   * @returns {Buffer}
   */
  get content() {
    return this.vfs.contents;
  },

  /**
   * Set file content
   * 
   * @param {Buffer|Stream|String} val file content
   */
  set content(val) {
    if (typeof val == 'string') {
      val = Buffer.from(val)
    }
    this.vfs.contents = val;
  },

  /**
   * Return file md5 hash
   * 
   * @returns {String}
   */
  get hash() {
    const md5sum = crypto.createHash('md5');
    md5sum.update(this.vfs.contents);
    return md5sum.digest('hex');
  },

  /**
   * 获取文件domain
   * 
   */
  get domain() {
    let domain = this.vfs._domain || "";
    if (typeof domain == "string") {
      domain = domain.split(/\s*,\s*/);
    }

    if (domain.length) {
      return domain[this.hash.charCodeAt(0) % domain.length];
    } else {
      return "";
    }
  },

  /**
   * 设置文件的domain，用逗号分隔可设置多个
   * 
   * @param {String}
   */
  set domain(val) {
    this.vfs._domain = val;
  },

  /**
   * 获取要发布文件的url地址
   * 
   * @returns {String}
   */
  get url() {
    return url.format(_.mergeWith(url.parse(this.domain), url.parse(this.vfs._url || '/'), (objValue, srcValue) => {
      if (srcValue) {
        return srcValue;
      }
      return objValue
    }));
  },

  /**
   * 设置文件发布的url地址
   * 
   * @returns {String}
   */
  set url(val) {
    this.vfs._url = val;
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
