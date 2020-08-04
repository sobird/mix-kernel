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
  ctx.vfs.contents = "Hello Mix";
});

mix.release();
```