/**
 * mix-kernel.js
 * 
 * sobird<i@sobird.me> at 2020/07/30 21:33:57 created.
 */
const path = require('path');
const util = require('util');
const EventEmitter = require('events');

const debug = require('debug')('mix:kernel');
const { PassThrough } = require('stream');
const mapstream = require('map-stream');
const File = require('vinyl');
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
    this.destdir = "./dest";
    // 共享数据
    this.state = {};
  }

  use(fn = () => { }) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  src(globs, options) {
    options = Object.assign({
      dot: false,
      nodir: true,
      destdir: this.destdir,
      ignore: ['node_modules/**/*']
    }, options);

    let destdir = path.resolve(options.destdir);
    let distdir = path.resolve(path.basename(options.destdir));

    // 排除掉输出目录
    if (destdir == distdir) {
      options.ignore = options.ignore.concat(path.basename(options.destdir) + '/**/*');
    }

    if (typeof globs == 'string') {
      globs = [globs];
    }

    this.destdir = destdir;

    return vfs.src(globs, options);
  }

  dest(destdir, options) {
    destdir = destdir || this.destdir;
    return vfs.dest(destdir, options);
  }

  /**
   * fork something to destdir file
   * 
   * @param {String|Buffer|Stream} anything 
   * @param {Object} options 
   * @param {Boolean} skip 是否跳过中间件
   */
  fork(something, options, skip = true) {
    let pass = new PassThrough();
    options = Object.assign({
      path: '',
      cwd: process.cwd(),
      base: process.cwd(),
      fork: true
    }, options);

    let st = pass.end(something).pipe(mapstream(function (chunk, callback) {
      let file = new File(options);
      file.contents = chunk;
      callback(null, file);
    }));

    if (!skip) {
      st = st.pipe(this.link());
    }

    st.pipe(this.dest());
  }

  release(globs = ['**/*.js'], options = {}) {
    this.src(globs, options).pipe(this.link()).pipe(this.dest());
  }

  /**
   * 中间件连接器(管道)，遍历文件对象
   * 
   * @param {Context} ctx context
   * @param {Function} callback 
   * @returns {Stream} 
   */
  link() {
    return mapstream((data, callback) => {
      const ctx = this.createContext(data);
      const onerror = err => ctx.onerror(err);
      if (!this.listenerCount('error')) {
        this.on('error', this.onerror);
      }

      compose(this.middleware)(ctx).then(res => {
        // todo 
      }).catch(err => {
        try {
          callback(err, data)
        } catch (err) {
          onerror(err)
        }
      });
      // 
      callback(null, data)
    });
  }

  createContext(vfs) {
    const context = Object.create(this.context);
    context.mix = this;
    context.vfs = vfs;
    context.state = this.state;
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
