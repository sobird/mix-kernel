/**
 * varpath.js
 * 
 * @see https://github.com/webpack/webpack/blob/master/lib/TemplatedPathPlugin.js
 * sobird<i@sobird.me> at 2020/08/05 14:50:47 created.
 */

const REGEXP_HASH = /\[hash(?::(\d+))?\]/gi; // ✔️
const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/gi;
const	REGEXP_MODULEHASH = /\[modulehash(?::(\d+))?\]/gi;
const	REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/gi;
const REGEXP_NAME = /\[name\]/gi; //  ✔️
const REGEXP_ID = /\[id\]/gi;
const REGEXP_MODULEID = /\[moduleid\]/gi;
const REGEXP_FILENAME = /\[filename\]/gi; //  ✔️
const REGEXP_BASENAME = /\[basename\]/gi; //  ✔️
const REGEXP_EXT = /\[ext\]/gi; //  ✔️
const REGEXP_QUERY = /\[query\]/gi;
const REGEXP_URL = /\[url\]/gi;

// Using global RegExp for .test is dangerous
// We use a normal RegExp instead of .test
const REGEXP_HASH_FOR_TEST = new RegExp(REGEXP_HASH.source, "i");
const REGEXP_CHUNKHASH_FOR_TEST = new RegExp(REGEXP_CHUNKHASH.source, "i");
const REGEXP_CONTENTHASH_FOR_TEST = new RegExp(REGEXP_CONTENTHASH.source, "i");
const REGEXP_NAME_FOR_TEST = new RegExp(REGEXP_NAME.source, "i");

const withHashLength = (replacer, handlerFn, assetInfo) => {
  const fn = (match, hashLength, ...args) => {
    if (assetInfo) assetInfo.immutable = true;
    const length = hashLength && parseInt(hashLength, 10);
    if (length && handlerFn) {
      return handlerFn(length);
    }
    const hash = replacer(match, hashLength, ...args);
    return length ? hash.slice(0, length) : hash;
  };
  return fn;
};

const getReplacer = (value, allowEmpty) => {
  const fn = (match, ...args) => {
    // last argument in replacer is the entire input string
    const input = args[args.length - 1];
    if (value === null || value === undefined) {
      if (!allowEmpty) {
        throw new Error(
          `Path variable ${match} not implemented in this context: ${input}`
        );
      }
      return "";
    } else {
      return `${escapePathVariables(value)}`;
    }
  };
  return fn;
};

const escapePathVariables = value => {
  return typeof value === "string"
    ? value.replace(/\[(\\*[\w:]+\\*)\]/gi, "[\\$1\\]")
    : value;
};

const replacePathVariables = (path, ctx, assetInfo) => {
  const name = ctx.name;
  const hash = ctx.hash
  const chunkName = name;
  const chunkHash = hash;
  const chunkHashWithLength = (l) => {
    console.log(l)
  };
  const contentHash = hash;

  // const module = data.module;
  // const moduleId = module && module.id;
  // const moduleHash = module && (module.renderedHash || module.hash);
  // const moduleHashWithLength = module && module.hashWithLength;

  if (typeof path === "function") {
    path = path(data);
  }

  if (
    ctx.noChunkHash &&
    (REGEXP_CHUNKHASH_FOR_TEST.test(path) ||
      REGEXP_CONTENTHASH_FOR_TEST.test(path))
  ) {
    throw new Error(
      `Cannot use [chunkhash] or [contenthash] for chunk in '${path}' (use [hash] instead)`
    );
  }

  return (
    path
      .replace(
        REGEXP_HASH,
        withHashLength(getReplacer(hash))
      )
      // .replace(
      //   REGEXP_CHUNKHASH,
      //   withHashLength(getReplacer(chunkHash), null, assetInfo)
      // )
      // .replace(
      //   REGEXP_CONTENTHASH,
      //   withHashLength(
      //     getReplacer(contentHash),
      //     contentHashWithLength,
      //     assetInfo
      //   )
      // )
      // .replace(
      //   REGEXP_MODULEHASH,
      //   withHashLength(getReplacer(moduleHash), moduleHashWithLength, assetInfo)
      // )
      // .replace(REGEXP_ID, getReplacer(chunkId))
      // .replace(REGEXP_MODULEID, getReplacer(moduleId))
       .replace(REGEXP_NAME, getReplacer(name))
       .replace(REGEXP_FILENAME, getReplacer(ctx.filename))
       .replace(REGEXP_BASENAME, getReplacer(ctx.basename))
       .replace(REGEXP_EXT, getReplacer(ctx.extname))
      // // query is optional, it's OK if it's in a path but there's nothing to replace it with
      // .replace(REGEXP_QUERY, getReplacer(ctx.query, true))
      // // only available in sourceMappingURLComment
      // .replace(REGEXP_URL, getReplacer(ctx.url))
      .replace(/\[\\(\\*[\w:]+\\*)\\\]/gi, "[$1]")
  );
};

module.exports = replacePathVariables;