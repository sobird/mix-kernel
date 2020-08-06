# mix-kernel
The streaming build system based on Middleware

## Installation
```
$ npm install mix-kernel
```

## Usage
```
const Mix = require('mix-kernel');
const mix = new Mix();

mix.use(ctx => {
  ctx.content = "Hello Mix";
});

mix.release();
```

## API

### fork(something, [options], [skip])
```
const Mix = require('mix-kernel');
const mix = new Mix();
const browserify = require('browserify');

mix.use(ctx => {
  // 此处的条件判断，需要注意循环依赖报错
  if(ctx.basename == "querystring.js") {
    const b = browserify();
    b.require('querystring');
    
    b.bundle((err, buf) => {
      mix.fork(buf, {
        // 该值不可为空，产出的文件名不能为空
        path: './test/querystring.js'
      }, false);
    });
  }
});

mix.release();
```