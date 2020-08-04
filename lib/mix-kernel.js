/**
 * mix-kernel.js
 * 
 * sobird<i@sobird.me> at 2020/07/30 21:33:57 created.
 */
const path = require('path');
const EventEmitter = require('events');

const debug = require('debug')('mix:kernel');
const map = require('map-stream');
const vfs = require('vinyl-fs');

/**
 * Expose `Mix` class.
 * Inherits from `EventEmitter.prototype`.
 */
module.exports = class Mix extends EventEmitter {
  constructor(options = {}) {
    super();
    this.env = options.env || process.env.NODE_ENV || 'development';
    this.middleware = [];
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
      this.callback(data);
      callback(null, data)
    })).pipe(vfs.dest(dest));
  }

  callback(file) {
    const fn = compose(this.middleware);
    fn(file).then(() => {
      console.log('finshed');
    }).catch(() => {
      // todo
    });
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
