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

## Context
Mix Context 将文件对象封装在vfs中，为后续处理文件提供了很多有用的方法和属性。context会在每个文件流中被创建，中间件中作为参数来使用。

### ctx.vfs
虚拟文件对象

### ctx.stat
查询文件信息
```
Stats {
  dev: 16777224,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 12001100,
  size: 6203,
  blocks: 16,
  atimeMs: 1589770740255.5278,
  mtimeMs: 1579072670037.4934,
  ctimeMs: 1579072670037.4934,
  birthtimeMs: 1579071396746.5276,
  atime: 2020-05-18T02:59:00.256Z,
  mtime: 2020-01-15T07:17:50.037Z,
  ctime: 2020-01-15T07:17:50.037Z,
  birthtime: 2020-01-15T06:56:36.747Z
}
```

### ctx.cwd
文件当前目录

### ctx.base
文件基本目录

### ctx.name

文件名不带文件后缀

### ctx.name=
设置文件名，支持模板变量替换。
支持模板变量替换的属性有：
* name
* basename
* filename

支持的模板有：
* [name]
* [hash]
* [basename]
* [filename]
* [ext]
```
ctx.name = "[name].[hash:6]";

// 得到输出的文件名：test.caf9e72.js
```

### ctx.basename
获取带有文件后缀的文件名，例如：test.js

### ctx.basename=
设置文件名，支持模板变量替换

### ctx.filename
获取文件名

### ctx.filename=
设置文件名，支持模板变量替换

### ctx.realpath
获取文件的真实地址，全路径地址

### ctx.realpath=
设置文件的真实地址，全路径地址

### ctx.extname
获取文件的文件名后缀

### ctx.extname=
设置文件的文件名后缀

### ctx.dirname
获取文件所在目录

### ctx.dirname=
设置文件所在目录

### ctx.content
获取文件内容，一般是Buffer类型

### ctx.content=
设置文件内容，可以是String、Buffer、Stream类型

### ctx.hash
获取文件内容hash值

### ctx.domain
获取文件domain地址

### ctx.domain=
设置文件domain地址，可以用逗号分隔多个domain

### ctx.url
获取文件的最终发布地址

### ctx.url
设置文件的最终发布地址

### ctx.onerror
错误处理句柄