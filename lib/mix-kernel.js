/**
 * mix-kernel.js
 * 
 * sobird<i@sobird.me> at 2020/07/30 21:33:57 created.
 */
const path = require('path');
const util = require('util');
const EventEmitter = require('events');

const debug = require('debug')('mix:kernel');
const map = require('map-stream');
const vfs = require('vinyl-fs');

const context = require('./context');

/**
 * Expose `Mix` class.
 * Inherits from `EventEmitter.prototype`.
 */
module.exports = class Mix extends EventEmitter {
  constructor(options = {}) {
    super();
    this.env = options.env || process.env.NODE_ENV || 'development';
    this.middleware = [];
    this.context = Object.create(context);
  }

  use(fn = () => { }) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  release(globs = ['**/*.js'], options = {}) {
    options = Object.assign({
      dot: false,
      nodir: true,
      dest: './output',
      ignore: ['node_modules/**/*']
    }, options);

    let dest = path.resolve(options.dest);
    let dist = path.resolve(path.basename(options.dest));

    // 排除掉输出目录
    if (dest == dist) {
      options.ignore = options.ignore.concat(path.basename(options.dest) + '/**/*');
    }

    if (typeof globs == 'string') {
      globs = [globs];
    }

    vfs.src(globs, options).pipe(map((data, callback) => {
      const ctx = this.createContext(data);
      const onerror = err => ctx.onerror(err);
      this.callback(ctx).catch(err => {
        try {
          callback(err, data)
        } catch (err) {
          onerror(err)
        }
      });
      callback(null, data)
    })).pipe(vfs.dest(dest));
  }

  callback(ctx) {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    return fn(ctx).then(() => {
      console.log('finshed');
    });
  }

  createContext(vfs) {
    const context = Object.create(this.context);
    context.mix = this;
    context.vfs = vfs;
    context.state = {};
    return context;
  }

  /**
   * Default error handler.
   *
   * @param {Error} err
   */
  onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
}

function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  /**
   * @param {Object} context
   * @return {Promise}
   * @api public
   */
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
